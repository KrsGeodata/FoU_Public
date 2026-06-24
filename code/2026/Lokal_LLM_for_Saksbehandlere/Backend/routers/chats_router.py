"""
routers/chats_router.py
-------------------
Declares the endpoints related to chats and chat messages.

Endpoints:
    POST    /chats                     -> create a new chat
    POST    /chats/messages            -> create a new chat message
    GET     /chats/{chat_id}           -> get a chat by its ChatId
    GET     /chats/user/{user_id}      -> get all chats related to a user
    GET     /chats/case/{case_id}      -> get all chats related to a case
    GET     /chats/{chat_id}/messages  -> get all messages for a chat
    PUT     /chats/{chat_id}           -> update a chat by its ChatId
    DELETE  /chats/{chat_id}           -> delete a chat by its ChatId and all related files from disk

"""
from fastapi import APIRouter, HTTPException, status
from classes import Chat, ChatMessage
from services.chat_service import get_chat_messages_for_chat_by_id, get_active_chat_by_id, get_chats_by_user_id, get_chats_by_case_id, create_chat, update_chat_db, create_chat_message, soft_delete_chat

# ========================================== #
#           Constants and Variables          #
# ========================================== #
chats_router = APIRouter()


# ========================================== #
#           CREATE - ENDPOINTS               #
# ========================================== #
@chats_router.post("/chats", operation_id="upload_chat", status_code=status.HTTP_201_CREATED)
async def upload_chat(chat: Chat) -> Chat:
  """Creates a new chat in the database"""
  if chat.ChatId is not None and chat.ChatId != 0:
    raise HTTPException(status_code=400, detail="ChatId must be null or 0 when creating a new chat")
  
  if chat.UserId is None or chat.UserId <= 0:
    raise HTTPException(status_code=400, detail="UserId must be a positive integer")
  
  try:
    uploaded_chat = await create_chat(chat)
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Failed to create chat: {e}")
  
  if not uploaded_chat:
    raise HTTPException(status_code=500, detail="Failed to create chat")
  return uploaded_chat


@chats_router.post("/chats/messages", operation_id="upload_chat_message", status_code=status.HTTP_201_CREATED)
async def upload_chat_message(chat_message: ChatMessage) -> ChatMessage:
  """Creates a new chat in the database"""
  if chat_message.ChatMessageId is not None and chat_message.ChatMessageId != 0:
    raise HTTPException(status_code=400, detail="ChatMessageId must be null or 0 when creating a new chat message")
  
  if chat_message.ChatId is None or chat_message.ChatId <= 0:
    raise HTTPException(status_code=400, detail="ChatId must be a positive integer")
  
  try:
    uploaded_chat_message = await create_chat_message(chat_message)
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Failed to create chat message: {e}")
  
  if not uploaded_chat_message:
    raise HTTPException(status_code=500, detail="Failed to create chat message")
  return uploaded_chat_message


# ========================================== #
#           READ - ENDPOINTS                 #
# ========================================== #
@chats_router.get("/chats/{chat_id}", operation_id="get_chat_by_id", status_code=status.HTTP_200_OK)
async def get_chat_by_id(chat_id: int) -> Chat:
  """Gets a chat based on the ChatId"""
  if chat_id is None or chat_id <= 0:
      raise HTTPException(status_code=400, detail="Invalid chat id")

  try:
    chat = await get_active_chat_by_id(chat_id)
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Failed to get chat: {e}")
  
  if chat is None:
    raise HTTPException(status_code=404, detail="Chat not found")
  
  return chat


@chats_router.get("/chats/user/{user_id}", operation_id="get_user_chats", status_code=status.HTTP_200_OK)
async def get_user_chats(user_id: int) -> list[Chat]:
  """Gets all chats related to a user based on user_id"""
  if user_id is None or user_id <= 0:
      raise HTTPException(status_code=400, detail="Invalid user id")

  try:
    chats = await get_chats_by_user_id(user_id)
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Failed to get chats: {e}")
  
  if chats is None:
    raise HTTPException(status_code=404, detail="Chats not found for user")
  
  return chats


@chats_router.get("/chats/case/{case_id}", operation_id="get_case_chats", status_code=status.HTTP_200_OK)
async def get_case_chats(case_id: int) -> list[Chat]:
  """Gets all chats related to a user based on user_id"""
  if case_id is None or case_id <= 0:
      raise HTTPException(status_code=400, detail="Invalid case id")

  try:
    chats = await get_chats_by_case_id(case_id)
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Failed to get chats: {e}")
  
  if chats is None:
    raise HTTPException(status_code=404, detail="Chats not found for case")
  
  return chats


@chats_router.get("/chats/{chat_id}/messages", operation_id="get_chat_messages_for_chat", status_code=status.HTTP_200_OK)
async def get_chat_messages_for_chat(chat_id: int) -> list[ChatMessage]:
  """Gets all chat messages for a given ChatId"""
  if chat_id is None or chat_id <= 0:
      raise HTTPException(status_code=400, detail="Invalid chat id")

  try:
    messages = await get_chat_messages_for_chat_by_id(chat_id)
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Failed to get chat messages: {e}")
  
  if messages is None:
    raise HTTPException(status_code=404, detail="Chat messages not found")
  
  return messages



# ========================================== #
#           UPDATE - ENDPOINTS               #
# ========================================== #
@chats_router.put("/chats/{chat_id}", operation_id="update_chat", status_code=status.HTTP_200_OK)
async def update_chat(chat_id: int, chat: Chat) -> Chat:
  """Updates a chat in the database based on the ChatId"""
  if chat.ChatId != chat_id:
    raise HTTPException(status_code=400, detail="ChatId in path and body do not match")
  
  try:
    updated_chat = await update_chat_db(chat)
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Failed to update chat: {e}")
  
  if updated_chat is None:
    raise HTTPException(status_code=500, detail="Failed to update chat")
  
  return updated_chat


# ========================================== #
#           DELETE - ENDPOINTS               #
# ========================================== #
@chats_router.delete("/chats/{chat_id}", operation_id="delete_chat", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chat(chat_id: int):
  """Deletes a chat from the database and all its related files from the disk based on the ChatId"""
  if chat_id is None or chat_id <= 0:
    raise HTTPException(status_code=400, detail="Invalid chat id")
  
  try:
    success = await soft_delete_chat(chat_id)
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Failed to delete chat: {e}")
  
  if not success:
    raise HTTPException(status_code=500, detail="Failed to delete chat")

  return success

# ========================================== #