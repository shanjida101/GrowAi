from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import Base, engine
from app import models
from app.routers import products, dues, forecast, reports, sales  # ← ensure sales is imported

app = FastAPI()

# 🔐 CORS – allow your LAN dev origins and make preflight succeed
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.0.103:3000",   # ← your device’s frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,         # or use allow_origin_regex=".*" for dev
    allow_credentials=True,
    allow_methods=["*"],           # ← allow POST/OPTIONS/etc
    allow_headers=["*"],           # ← allow Content-Type, etc
)

# DB init
models.Base.metadata.create_all(bind=engine)

# 🔌 Mount all routers (including sales!)
app.include_router(products.router)
app.include_router(dues.router)
app.include_router(forecast.router)
app.include_router(reports.router)
app.include_router(sales.router)    # ← do NOT forget this
