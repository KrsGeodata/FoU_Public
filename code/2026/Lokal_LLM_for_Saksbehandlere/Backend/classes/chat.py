from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime

# Data model for receiving and sending Chats to the .NET WinUI app

class Chat(BaseModel):
    ChatId:Optional[int] = None
    CaseId:Optional[int] = None
    UserId:int
    Title:Optional[str] = None
    Description:Optional[str] = None
    CreatedAt:Optional[datetime] = None

    @field_validator("ChatId", "CaseId", mode="before")
    @classmethod
    def zero_to_none(cls, value):
        if value == 0:
            return None
        return value