from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import models, schemas

router = APIRouter(prefix="/api/v1/products", tags=["products"])

@router.get("/", response_model=list[schemas.ProductOut])
def list_products(db: Session = Depends(get_db)):
    return db.query(models.Product).order_by(models.Product.id.desc()).all()

@router.post("/", response_model=schemas.ProductOut)
def create_product(body: schemas.ProductCreate, db: Session = Depends(get_db)):
    p = models.Product(**body.model_dump())
    db.add(p); db.commit(); db.refresh(p)
    return p

@router.patch("/{pid}", response_model=schemas.ProductOut)
def update_product(pid: int, body: schemas.ProductUpdate, db: Session = Depends(get_db)):
    p = db.query(models.Product).get(pid)
    if not p: raise HTTPException(404, "Product not found")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(p, k, v)
    db.commit(); db.refresh(p)
    return p

@router.delete("/{pid}")
def delete_product(pid: int, db: Session = Depends(get_db)):
    p = db.query(models.Product).get(pid)
    if not p: raise HTTPException(404, "Product not found")
    db.delete(p); db.commit()
    return {"ok": True}
