from __future__ import annotations

from pathlib import Path

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_SQLITE_PATH = BASE_DIR / "data" / "bookmate.db"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    ENVIRONMENT: str = "development"
    APP_NAME: str = "Bookmate"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"
    DATABASE_URL: str = f"sqlite+aiosqlite:///{DEFAULT_SQLITE_PATH.as_posix()}"
    OPENAI_API_KEY: str | None = None
    GOOGLE_BOOKS_API_KEY: str | None = None
    JWT_SECRET_KEY: str = "supersecretbookmate"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ENABLE_SAMPLE_DATA: bool = False
    FRONTEND_URL: str = "http://localhost:5173"
    BACKEND_CORS_ORIGINS: str = Field(
        default="http://localhost:5173,http://127.0.0.1:5173",
        validation_alias=AliasChoices("BACKEND_CORS_ORIGINS", "CORS_ORIGINS"),
    )
    SQLITE_TIMEOUT_SECONDS: float = 30.0

    @property
    def cors_origins(self) -> list[str]:
        origins = {
            origin.strip().rstrip("/")
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

    @property
    def sync_database_url(self) -> str:
        if self.sqlalchemy_database_url.startswith("sqlite+aiosqlite:///"):
            return self.sqlalchemy_database_url.replace("sqlite+aiosqlite:///", "sqlite:///", 1)
        if self.sqlalchemy_database_url.startswith("postgresql+asyncpg://"):
            return self.sqlalchemy_database_url.replace("postgresql+asyncpg://", "postgresql+psycopg://", 1)
        return self.sqlalchemy_database_url

    @property
    def sqlite_database_path(self) -> Path | None:
        prefix = "sqlite+aiosqlite:///"
        if not self.sqlalchemy_database_url.startswith(prefix):
            return None

        raw_path = self.sqlalchemy_database_url[len(prefix) :]
        if raw_path == ":memory:":
            return None

        candidate = Path(raw_path)
        if not candidate.is_absolute():
            candidate = (BASE_DIR / candidate).resolve()
        return candidate


settings = Settings()


def get_settings() -> Settings:
    return settings
