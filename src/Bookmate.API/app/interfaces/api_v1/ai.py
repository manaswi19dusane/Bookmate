from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.application.services.ai_chat_service import AIChatService
router = APIRouter(prefix="/api/ai", tags=["ai"])


class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

async def get_ai_service():
    yield AIChatService()

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, service: AIChatService = Depends(get_ai_service)):
    reply = await service.get_response(request.message)
    return {"reply": reply}
