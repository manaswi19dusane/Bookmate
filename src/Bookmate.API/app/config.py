from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./bookmate.db"
    APP_NAME: str = "BookMate"
    DEBUG: bool = True
    OPENAI_API_KEY: str
    class Config:
        env_file = ".env"

settings = Settings()
