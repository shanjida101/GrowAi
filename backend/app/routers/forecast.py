from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from app.db import get_db
from app import models, schemas
from app.utils.forecasting import holt_additive, build_future_dates

router = APIRouter(prefix="/api/v1/forecast", tags=["forecast"])

@router.post("/", response_model=schemas.ForecastOut)
def forecast(body: schemas.ForecastIn, db: Session = Depends(get_db)):
    product = db.query(models.Product).get(body.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    q = (
        db.query(models.Sale)
        .filter(models.Sale.product_id == product.id)
        .order_by(models.Sale.created_at.asc())
        .all()
    )
    # convert DB values to floats to satisfy holt_additive(List[float]) typing
    series = [float(s.qty or 0) for s in q]
    if not series:
        base = max(8, product.stock // 3)
        series = [float(max(0, base + int(3 * (i % 5) - 2))) for i in range(60)]

    horizon = body.horizon_days
    yhat = holt_additive(series, horizon)
    future_dates = build_future_dates(date.today(), horizon)
    points = [{"date": d, "forecast_qty": round(float(v), 2)} for d, v in zip(future_dates, yhat)]
    return {"points": points}
