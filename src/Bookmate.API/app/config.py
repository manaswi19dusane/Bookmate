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

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

def get_settings():
    return settings
