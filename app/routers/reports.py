# app/routers/reports.py
from datetime import datetime, timedelta, date
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db import get_db
from app import models, schemas

router = APIRouter(prefix="/api/v1/reports", tags=["reports"])


# ----- helpers
def _sum_sales_total(q):
    # total = SUM(qty * unit_price)
    return func.coalesce(func.sum(models.Sale.qty * models.Sale.unit_price), 0.0)


def _today_bounds() -> tuple[datetime, datetime]:
    today = date.today()
    start = datetime.combine(today, datetime.min.time())
    end = datetime.combine(today, datetime.max.time())
    return start, end


def _week_bounds() -> tuple[datetime, datetime]:
    today = date.today()
    start = datetime.combine(today - timedelta(days=today.weekday()), datetime.min.time())  # Monday
    end = datetime.combine(today, datetime.max.time())
    return start, end


def _month_bounds() -> tuple[datetime, datetime]:
    today = date.today()
    start = datetime(today.year, today.month, 1)
    end = datetime.combine(today, datetime.max.time())
    return start, end


# =========================
# Summary KPIs for dashboard
# =========================
@router.get("/summary", response_model=schemas.ReportSummary)
def summary(db: Session = Depends(get_db)):
    # Today sales total
    t0, t1 = _today_bounds()
    today_total = db.query(_sum_sales_total(models.Sale)).filter(
        models.Sale.created_at >= t0, models.Sale.created_at <= t1
    ).scalar() or 0.0

    # This week total
    w0, w1 = _week_bounds()
    week_total = db.query(_sum_sales_total(models.Sale)).filter(
        models.Sale.created_at >= w0, models.Sale.created_at <= w1
    ).scalar() or 0.0

    # This month total
    m0, m1 = _month_bounds()
    month_total = db.query(_sum_sales_total(models.Sale)).filter(
        models.Sale.created_at >= m0, models.Sale.created_at <= m1
    ).scalar() or 0.0

    # Pending dues
    total_dues = db.query(func.coalesce(func.sum(models.Due.amount), 0.0)).filter(
        models.Due.is_settled == False  # noqa: E712
    ).scalar() or 0.0

    # Low stock
    low_stock = db.query(models.Product).filter(
        models.Product.stock <= models.Product.reorder_point
    ).count()

    # Top product (by revenue) last 30d
    d0 = datetime.now() - timedelta(days=30)
    top_row = (
        db.query(
            models.Product.name.label("name"),
            func.coalesce(func.sum(models.Sale.qty * models.Sale.unit_price), 0.0).label("revenue"),
        )
        .join(models.Product, models.Product.id == models.Sale.product_id)
        .filter(models.Sale.created_at >= d0)
        .group_by(models.Product.id)
        .order_by(func.sum(models.Sale.qty * models.Sale.unit_price).desc())
        .first()
    )
    top_product = schemas.TopProduct(name=top_row.name, revenue=float(top_row.revenue)) if top_row else None

    return schemas.ReportSummary(
        today_sales=float(today_total),
        week_sales=float(week_total),
        month_sales=float(month_total),
        pending_dues=float(total_dues),
        low_stock=low_stock,
        top_product=top_product,
    )


# =========================
# Sales series for charts
# =========================
@router.get("/sales-series", response_model=List[schemas.SeriesPoint])
def sales_series(days: int = Query(30, ge=1, le=120), db: Session = Depends(get_db)):
    start = date.today() - timedelta(days=days - 1)
    rows = (
        db.query(
            func.date(models.Sale.created_at).label("d"),
            func.coalesce(func.sum(models.Sale.qty * models.Sale.unit_price), 0.0).label("total"),
        )
        .filter(models.Sale.created_at >= start)
        .group_by(func.date(models.Sale.created_at))
        .order_by(func.date(models.Sale.created_at))
        .all()
    )
    # Fill missing dates with 0
    by_day = {str(r.d): float(r.total) for r in rows}
    out: List[schemas.SeriesPoint] = []
    for i in range(days):
        d = (start + timedelta(days=i)).isoformat()
        out.append(schemas.SeriesPoint(date=d, value=by_day.get(d, 0.0)))
    return out


# =========================
# Top N products (revenue)
# =========================
@router.get("/top-products", response_model=List[schemas.TopProduct])
def top_products(limit: int = Query(5, ge=1, le=20), db: Session = Depends(get_db)):
    rows = (
        db.query(
            models.Product.name.label("name"),
            func.coalesce(func.sum(models.Sale.qty * models.Sale.unit_price), 0.0).label("revenue"),
        )
        .join(models.Product, models.Product.id == models.Sale.product_id)
        .group_by(models.Product.id)
        .order_by(func.sum(models.Sale.qty * models.Sale.unit_price).desc())
        .limit(limit)
        .all()
    )
    return [schemas.TopProduct(name=r.name, revenue=float(r.revenue)) for r in rows]


# =========================
# Category revenue share
# =========================
@router.get("/category-share", response_model=List[schemas.CategoryShare])
def category_share(db: Session = Depends(get_db)):
    rows = (
        db.query(
            models.Product.category.label("category"),
            func.coalesce(func.sum(models.Sale.qty * models.Sale.unit_price), 0.0).label("revenue"),
        )
        .join(models.Product, models.Product.id == models.Sale.product_id)
        .group_by(models.Product.category)
        .order_by(func.sum(models.Sale.qty * models.Sale.unit_price).desc())
        .all()
    )
    total = sum(float(r.revenue) for r in rows) or 1.0
    return [
        schemas.CategoryShare(category=r.category, revenue=float(r.revenue), pct=round(float(r.revenue) * 100.0 / total, 2))
        for r in rows
    ]


# =========================
# Recent activity feed
# =========================
@router.get("/recent", response_model=List[schemas.ActivityItem])
def recent(limit: int = Query(10, ge=1, le=50), db: Session = Depends(get_db)):
    # latest sales
    sales = (
        db.query(
            models.Sale.id.label("id"),
            models.Sale.created_at.label("ts"),
            models.Product.name.label("product_name"),
            models.Sale.qty.label("qty"),
            models.Sale.unit_price.label("price"),
            models.Sale.is_credit.label("is_credit"),
        )
        .join(models.Product, models.Product.id == models.Sale.product_id)
        .order_by(models.Sale.created_at.desc())
        .limit(limit)
        .all()
    )

    # latest dues
    dues = (
        db.query(
            models.Due.id.label("id"),
            models.Due.created_at.label("ts"),
            models.Due.customer_name.label("customer_name"),
            models.Due.amount.label("amount"),
            models.Due.is_settled.label("is_settled"),
        )
        .order_by(models.Due.created_at.desc())
        .limit(limit)
        .all()
    )

    # merge & sort by timestamp
    items: List[schemas.ActivityItem] = []
    for s in sales:
        items.append(
            schemas.ActivityItem(
                type="sale",
                ts=s.ts,
                title=f"Sold {s.qty} × {s.product_name}",
                subtitle=("Credit" if s.is_credit else "Cash"),
                amount=float(s.qty * s.price),
            )
        )
    for d in dues:
        items.append(
            schemas.ActivityItem(
                type="due",
                ts=d.ts,
                title=f"Due: {d.customer_name}",
                subtitle=("Settled" if d.is_settled else "Pending"),
                amount=float(d.amount),
            )
        )
    items.sort(key=lambda x: x.ts, reverse=True)
    return items[:limit]
