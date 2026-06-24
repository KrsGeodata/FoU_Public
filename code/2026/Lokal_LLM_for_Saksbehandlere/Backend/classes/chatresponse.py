from pydantic import BaseModel
from typing import Optional
from .chatmessage import ChatMessage
from .filesinfo import FilesInfo

class ChatResponse(BaseModel):
    UserMessage: Optional[ChatMessage] = None
    AIResponse: Optional[ChatMessage] = None
    FilesInfos: Optional[list[FilesInfo]] = []  # List of file metadata dicts, can be expanded to a more detailed model if needed