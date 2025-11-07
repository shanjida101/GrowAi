# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import Base, engine
from app.routers import products, sales, dues, forecast, reports

Base.metadata.create_all(bind=engine)

app = FastAPI(title="GrowAI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://grow-ai-u6gh.vercel.app",  # your Vercel site
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health(): return {"ok": True}

app.include_router(products.router)
app.include_router(sales.router)
app.include_router(dues.router)
app.include_router(forecast.router)
app.include_router(reports.router)
