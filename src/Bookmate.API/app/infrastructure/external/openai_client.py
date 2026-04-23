from openai import OpenAI
from app.config import settings

def get_openai_client() -> OpenAI | None:
    if not settings.OPENAI_API_KEY:
        return None
    return OpenAI(api_key=settings.OPENAI_API_KEY)
