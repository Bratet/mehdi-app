from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .routers import revenue, sessions, devices, products, customers, reports, predictions


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    yield
    # Shutdown


app = FastAPI(
    title="Game Center Analytics",
    description="Analytics and reporting service for Game Center",
    version="1.0.0",
    lifespan=lifespan,
    root_path="/api/v1",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(revenue.router, prefix="/analytics", tags=["Revenue"])
app.include_router(sessions.router, prefix="/analytics", tags=["Sessions"])
app.include_router(devices.router, prefix="/analytics", tags=["Devices"])
app.include_router(products.router, prefix="/analytics", tags=["Products"])
app.include_router(customers.router, prefix="/analytics", tags=["Customers"])
app.include_router(reports.router, prefix="/reports", tags=["Reports"])
app.include_router(predictions.router, prefix="/predictions", tags=["Predictions"])


@app.get("/health")
async def health():
    return {"status": "ok"}
