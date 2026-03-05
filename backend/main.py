import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from routers import auth, devices, sessions, products, billing, reports, expenses
from seed import seed_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await seed_data()
    yield


app = FastAPI(title="Game Center API", version="1.0.0", lifespan=lifespan)

cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(devices.router)
app.include_router(sessions.router)
app.include_router(products.router)
app.include_router(billing.router)
app.include_router(reports.router)
app.include_router(expenses.router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}


@app.get("/api/backup/export")
async def export_backup():
    # Placeholder for backup export
    return {"message": "Backup export not yet implemented"}


@app.post("/api/backup/import")
async def import_backup():
    # Placeholder for backup import
    return {"message": "Backup import not yet implemented"}
