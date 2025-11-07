from sqlalchemy import Column, Integer, String, REAL, Boolean, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from .db import Base

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, default="General", nullable=False)
    stock = Column(Integer, default=0, nullable=False)
    price = Column(REAL, default=0.0, nullable=False)
    reorder_point = Column(Integer, default=0, nullable=False)

    sales = relationship("Sale", back_populates="product")

class Sale(Base):
    __tablename__ = "sales"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    qty = Column(Integer, nullable=False)
    unit_price = Column(REAL, nullable=False)            # <-- required
    is_credit = Column(Boolean, default=False, nullable=False)
    customer_name = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    product = relationship("Product", back_populates="sales")

class Due(Base):
    __tablename__ = "dues"
    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, nullable=False)
    amount = Column(REAL, nullable=False)
    note = Column(String, nullable=True)
    is_settled = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
