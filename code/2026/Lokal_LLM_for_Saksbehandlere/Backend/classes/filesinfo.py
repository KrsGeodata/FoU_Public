from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
import uuid

# Data model for sending FileInfo to the .NET WinUI app

class FilesInfo(BaseModel):
  FileId: Optional[uuid.UUID] = None
  UserId: int
  CaseId: Optional[int] = None
  ChatId: Optional[int] = None
  ChatMessageId: Optional[int] = None
  UploadedAt: Optional[datetime] = None
  OriginalFilename: str
  FileExtension: str

  @field_validator("CaseId", "ChatId", "ChatMessageId", mode="before")
  @classmethod
  def zero_to_none(cls, value):
    if value == 0:
      return None
    return value