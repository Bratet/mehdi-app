from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import init_db
from app.config import settings
from app.routers import contact, newsletter


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="S Lounge API",
    description="Backend API for S Lounge – PlayStation & Games Café Management",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(contact.router, prefix="/api")
app.include_router(newsletter.router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "S Lounge API is running", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "ok"}
