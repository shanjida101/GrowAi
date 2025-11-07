from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import models, schemas

router = APIRouter(prefix="/api/v1/dues", tags=["dues"])

@router.get("/", response_model=list[schemas.DueOut])
def list_dues(db: Session = Depends(get_db)):
    return (
        db.query(models.Due)
        .order_by(models.Due.is_settled.asc(), models.Due.created_at.desc())
        .all()
    )

@router.post("/", response_model=schemas.DueOut)
def create_due(body: schemas.DueCreate, db: Session = Depends(get_db)):
    d = models.Due(**body.model_dump(), is_settled=False)
    db.add(d); db.commit(); db.refresh(d)
    return d

@router.patch("/{did}", response_model=schemas.DueOut)
def settle_due(did: int, db: Session = Depends(get_db)):
    d = db.query(models.Due).get(did)
    if not d: raise HTTPException(404, "Due not found")
    d.is_settled = True
    db.commit(); db.refresh(d)
    return d
