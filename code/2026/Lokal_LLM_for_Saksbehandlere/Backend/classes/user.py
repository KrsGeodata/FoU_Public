from pydantic import BaseModel, EmailStr
from typing import Optional

# Data model for receiving and sending User data to the .NET WinUI app

class UserData(BaseModel):
    UserId:int
    Name:Optional[str] = None
    Email:Optional[EmailStr] = None
