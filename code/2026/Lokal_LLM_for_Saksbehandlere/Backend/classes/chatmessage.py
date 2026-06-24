from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime

# Data model for receiving and sending chat messages to the .NET WinUI app
# Probably a cleaner way than adding an optional bool, because it's pretty meaningless. 
# However, the database column is nullable
class ChatMessage(BaseModel):
    ChatMessageId:Optional[int] = None
    ChatId:Optional[int] = None
    MessageText:Optional[str] = None
    IsUserMessage: Optional[bool] = None
    CreatedAt:Optional[datetime] = None


    @field_validator("ChatMessageId", mode="before")
    @classmethod
    def zero_to_none(cls, value):
        if value == 0:
            return None
        return value 
    
    @field_validator("IsUserMessage", mode="before")
    @classmethod
    def none_to_false(cls, value):
        if value == None:
            return False
        return value 