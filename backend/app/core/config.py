from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://gamecenter:gamecenterpass@db:5432/gamecenterdb"
    REDIS_URL: str = "redis://redis:6379/0"
    JWT_SECRET: str = "change_this_in_production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 15
    JWT_REFRESH_EXPIRATION_DAYS: int = 7
    CORS_ORIGINS: str = "http://localhost:3000"
    BACKEND_PORT: int = 8000

    class Config:
        env_file = ".env"


settings = Settings()
