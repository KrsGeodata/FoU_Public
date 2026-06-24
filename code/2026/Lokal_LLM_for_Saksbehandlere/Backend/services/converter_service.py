"""
services/converter_service.py
-------------------
Handles conversions from one object structure to another.
"""

from pydantic_ai import ModelMessage, ModelRequest, ModelResponse, TextPart, UserPromptPart, UnexpectedModelBehavior
from classes import ChatMessage

def modelmessage_to_chatmessage(model_message: ModelMessage, chat_id: int | None = None) -> ChatMessage:
    ''' Converts Pydantic AI ModelMessage object to a ChatMessage object '''
    first_part = model_message.parts[0]

    if isinstance(model_message, ModelRequest):
        if isinstance(first_part, UserPromptPart):
            assert isinstance(first_part.content, str)

            return ChatMessage(
                ChatId=chat_id,
                MessageText=first_part.content,
                IsUserMessage=True,
                CreatedAt=first_part.timestamp,
            )

    elif isinstance(model_message, ModelResponse):
        if isinstance(first_part, TextPart):
            return ChatMessage(
                ChatId=chat_id,
                MessageText=first_part.content,
                IsUserMessage=False,
                CreatedAt=model_message.timestamp,
            )

    raise UnexpectedModelBehavior(
        f"Unexpected message type: {model_message}"
    )

def chatmessage_to_modelmessage(chat_message: ChatMessage) -> ModelMessage:
    ''' Converts a ChatMessage object to a Pydantic AI ModelMessage object '''
    if chat_message.IsUserMessage:
        return ModelRequest(
            parts=[
                UserPromptPart(
                    content=chat_message.MessageText or "",
                    timestamp=chat_message.CreatedAt,
                )
            ],
        )

    return ModelResponse(
        parts=[
            TextPart(chat_message.MessageText or "")
        ],
        timestamp=chat_message.CreatedAt,
    )