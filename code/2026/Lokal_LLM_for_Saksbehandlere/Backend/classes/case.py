from pydantic import BaseModel, EmailStr, field_validator
from enum import Enum
from typing import Optional
from datetime import datetime

# Data model for receiving and sending Cases to the .NET WinUI app

class CaseStatus(str, Enum):
    Active = "Active"
    Closed = "Closed"
    Archived = "Archived"

class Case(BaseModel):
    CaseId:Optional[int] = None
    UserId:int
    Title:Optional[str] = None
    Description:Optional[str] = None
    CreatedAt:Optional[datetime] = None
    Status:Optional[CaseStatus] = None

    @field_validator("CaseId", mode="before")
    @classmethod
    def zero_to_none(cls, value):
        if value == 0:
            return None
        return value
