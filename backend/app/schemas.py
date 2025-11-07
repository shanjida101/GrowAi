from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

# Products
class ProductBase(BaseModel):
    sku: str
    name: str
    category: str = "General"
    stock: int = 0
    price: float = 0.0
    reorder_point: int = 0

class ProductCreate(ProductBase): pass
class ProductUpdate(BaseModel):
    sku: Optional[str] = None
    name: Optional[str] = None
    category: Optional[str] = None
    stock: Optional[int] = None
    price: Optional[float] = None
    reorder_point: Optional[int] = None

class ProductOut(ProductBase):
    id: int
    class Config: from_attributes = True

# Sales
class SaleCreate(BaseModel):
    product_id: int
    qty: int = Field(gt=0)
    unit_price: float = Field(ge=0)
    is_credit: bool = False
    customer_name: Optional[str] = None

class SaleOut(BaseModel):
    id: int
    product_id: int
    qty: int
    unit_price: float
    is_credit: bool
    customer_name: Optional[str] = None
    created_at: datetime
    product_name: str

# Dues
class DueCreate(BaseModel):
    customer_name: str
    amount: float
    note: Optional[str] = None

class DueOut(BaseModel):
    id: int
    customer_name: str
    amount: float
    note: Optional[str] = None
    is_settled: bool
    created_at: datetime
    class Config: from_attributes = True

# Forecast
class ForecastIn(BaseModel):
    product_id: int
    horizon_days: int = Field(ge=1, le=60)

class ForecastPoint(BaseModel):
    date: str
    forecast_qty: float

class ForecastOut(BaseModel):
    points: List[ForecastPoint]
# ---------- Reports DTOs ----------
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class TopProduct(BaseModel):
  name: str
  revenue: float

class ReportSummary(BaseModel):
  today_sales: float
  week_sales: float
  month_sales: float
  pending_dues: float
  low_stock: int
  top_product: Optional[TopProduct] = None

class SeriesPoint(BaseModel):
  date: str
  value: float

class CategoryShare(BaseModel):
  category: str
  revenue: float
  pct: float

class ActivityItem(BaseModel):
  type: str                 # "sale" | "due"
  ts: datetime
  title: str
  subtitle: str
  amount: float
