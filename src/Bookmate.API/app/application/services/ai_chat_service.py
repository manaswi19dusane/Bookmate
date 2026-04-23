from __future__ import annotations

import anyio

from app.config import settings
from app.infrastructure.external.openai_client import get_openai_client

SYSTEM_PROMPT = """
You are Bookmate AI Assistant.
Help users with:
- Book search guidance
- Feature usage
- Navigation inside Bookmate app

Be concise and friendly.
"""

class AIChatService:
    async def get_response(self, message: str) -> str:
        if not settings.OPENAI_API_KEY:
            return (
                "AI chat is not configured right now. Set OPENAI_API_KEY to enable "
                "live recommendations."
            )

        def _request() -> str:
            client = get_openai_client()
            if client is None:
                return (
                    "AI chat is not configured right now. Set OPENAI_API_KEY to enable "
                    "live recommendations."
                )
            response = client.responses.create(
                model="gpt-4.1-mini",
                input=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": message},
                ],
            )
            return response.output_text

        try:
            return await anyio.to_thread.run_sync(_request)
        except Exception:
            return (
                "I couldn't reach the AI service just now. Try again shortly or "
                "continue using the rest of Bookmate."
            )
