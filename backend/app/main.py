from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .core.database import engine, Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup (dev only — use alembic in production)
    async with engine.begin() as conn:
        from . import models  # noqa: F401 — ensure all models are imported
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title="Game Center API",
    description="Game Center Management Platform API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include routers
from .routers import auth, users, establishments, devices, sessions, products, orders, customers, bookings, expenses, notifications  # noqa: E402

app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(establishments.router, prefix="/api/v1")
app.include_router(devices.router, prefix="/api/v1")
app.include_router(sessions.router, prefix="/api/v1")
app.include_router(products.router, prefix="/api/v1")
app.include_router(orders.router, prefix="/api/v1")
app.include_router(customers.router, prefix="/api/v1")
app.include_router(bookings.router, prefix="/api/v1")
app.include_router(expenses.router, prefix="/api/v1")
app.include_router(notifications.router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "ok"}
