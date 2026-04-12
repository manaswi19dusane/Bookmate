from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./bookmate.db"
    APP_NAME: str = "BookMate"
    DEBUG: bool = True
    OPENAI_API_KEY: str
    JWT_SECRET_KEY: str = "supersecretbookmate"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ENABLE_SAMPLE_DATA: bool = True  # Load sample data on startup if database is empty

    class Config:
        env_file = ".env"

settings = Settings()

def get_settings():
    return settings
