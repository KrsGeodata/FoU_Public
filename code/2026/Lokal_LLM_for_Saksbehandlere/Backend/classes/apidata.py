from pydantic import BaseModel
from .user import UserData
from .case import Case
from .chat import Chat
from .chatmessage import ChatMessage
from .filesinfo import FilesInfo


# Data model for receiving and sending APIData to the .NET WinUI app
class APIData(BaseModel):
    User: UserData
    Cases: list[Case] = []
    Chats: list[Chat] = []
    Messages: list[ChatMessage] = []
    Files: list[FilesInfo] = []
    