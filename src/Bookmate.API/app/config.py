from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./bookmate.db"
    APP_NAME: str = "BookMate"
    DEBUG: bool = True
    OPENAI_API_KEY: str | None = None
    GOOGLE_BOOKS_API_KEY: str | None = None
    JWT_SECRET_KEY: str = "supersecretbookmate"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ENABLE_SAMPLE_DATA: bool = False
    SMTP_HOST: str | None = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: str | None = Field(default=None, validation_alias=AliasChoices("SMTP_USERNAME", "SMTP_USER"))
    SMTP_PASSWORD: str | None = None
    SMTP_FROM_EMAIL: str | None = Field(default=None, validation_alias=AliasChoices("SMTP_FROM_EMAIL", "EMAIL_FROM"))
    SMTP_USE_TLS: bool = True

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

def get_settings():
    return settings
