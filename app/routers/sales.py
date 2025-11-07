# app/routers/sales.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import SessionLocal
from .. import models, schemas
from typing import Any, cast

router = APIRouter(prefix="/api/v1/sales", tags=["sales"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=list[schemas.SaleOut])
def list_sales(db: Session = Depends(get_db)):
    rows = (
        db.query(models.Sale, models.Product.name.label("product_name"))
        .join(models.Product, models.Product.id == models.Sale.product_id)
        .order_by(models.Sale.created_at.desc())
        .all()
    )
    out = []
    for sale, product_name in rows:
        out.append(
            schemas.SaleOut(
                id=sale.id,
                product_id=sale.product_id,
                qty=sale.qty,
                unit_price=sale.unit_price,
                is_credit=sale.is_credit,
                customer_name=sale.customer_name,
                created_at=sale.created_at,
                product_name=product_name,
            )
        )
    return out

@router.post("/", response_model=schemas.SaleOut)
def create_sale(payload: schemas.SaleCreate, db: Session = Depends(get_db)):
    product = db.query(models.Product).get(payload.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.stock < payload.qty:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    product.stock -= payload.qty

    sale = models.Sale(
        product_id=payload.product_id,
        qty=payload.qty,
        unit_price=payload.unit_price,
        is_credit=payload.is_credit,
        customer_name=(payload.customer_name or None),
    )
    db.add(sale)

    if payload.is_credit:
        due = models.Due(
            customer_name=payload.customer_name or "Unknown",
            amount=payload.qty * payload.unit_price,
            note=f"Credit sale for product #{payload.product_id}",
            is_settled=False,
        )
        db.add(due)

    # 🔴 THIS WAS LIKELY MISSING
    db.commit()
    db.refresh(sale)

    return schemas.SaleOut(
        id=int(cast(Any, sale.id)),
        product_id=int(cast(Any, sale.product_id)),
        qty=int(cast(Any, sale.qty)),
        unit_price=float(cast(Any, sale.unit_price)),
        is_credit=bool(cast(Any, sale.is_credit)),
        customer_name=cast(Any, sale.customer_name),
        created_at=cast(Any, sale.created_at),
        product_name=str(product.name),
    )
