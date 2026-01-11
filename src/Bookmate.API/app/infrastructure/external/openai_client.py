from openai import OpenAI
from app.config import settings

# Single OpenAI client instance (reuse across app)
client = OpenAI(
    api_key=settings.OPENAI_API_KEY
)