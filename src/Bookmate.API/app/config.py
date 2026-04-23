from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./bookmate.db"
    APP_NAME: str = "BookMate"
    DEBUG: bool = True
    OPENAI_API_KEY: str | None = None
    JWT_SECRET_KEY: str = "supersecretbookmate"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ENABLE_SAMPLE_DATA: bool = False
    FRONTEND_URL: str = "http://localhost:5173"
    BACKEND_CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    @property
    def cors_origins(self) -> list[str]:
        origins = {
            origin.strip()
            for origin in self.BACKEND_CORS_ORIGINS.split(",")
            if origin.strip()
        }
        if self.FRONTEND_URL:
            origins.add(self.FRONTEND_URL.strip().rstrip("/"))
        return sorted(origins)

    @property
    def sqlalchemy_database_url(self) -> str:
        if self.DATABASE_URL.startswith("postgres://"):
            return self.DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
        if self.DATABASE_URL.startswith("postgresql://"):
            return self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
        return self.DATABASE_URL

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

def get_settings():
    return settings
