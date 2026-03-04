from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://gamecenter:gamecenterpass@db:5432/gamecenterdb"
    JWT_SECRET: str = "change_this_in_production"
    JWT_ALGORITHM: str = "HS256"
    CORS_ORIGINS: str = "http://localhost:3000"
    ANALYTICS_PORT: int = 8000

    class Config:
        env_file = ".env"


settings = Settings()
