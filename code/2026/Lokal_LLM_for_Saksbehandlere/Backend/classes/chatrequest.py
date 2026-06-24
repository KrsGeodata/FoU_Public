from pydantic import BaseModel
from typing import Optional
from .chatmessage import ChatMessage

# Data model for receiving and sending chat messages to the .NET WinUI app

class ChatRequest(BaseModel):
    message:str
    history: list[dict] = []
    chat_id: int | None = None
    case_id: int | None = None


class ChatRequestv2(BaseModel):
    chat_message: ChatMessage
    user_id: int
    chat_id: int
    case_id: Optional[int] = None