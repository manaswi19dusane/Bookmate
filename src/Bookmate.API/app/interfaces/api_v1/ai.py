from fastapi import APIRouter
from pydantic import BaseModel
from app.application.services.ai_chat_service import AIChatService

router = APIRouter(prefix="/api/ai", tags=["ai"])

service = AIChatService()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    reply = service.get_response(request.message)
    return {"reply": reply}
