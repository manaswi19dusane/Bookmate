from app.infrastructure.external.openai_client import client

SYSTEM_PROMPT = """
You are Bookmate AI Assistant.
Help users with:
- Book search guidance
- Feature usage
- Navigation inside Bookmate app

Be concise and friendly.
"""

class AIChatService:
    def get_response(self, message: str) -> str:
        response = client.responses.create(
            model="gpt-4.1-mini",
            input=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": message}
            ]
        )
        return response.output_text
