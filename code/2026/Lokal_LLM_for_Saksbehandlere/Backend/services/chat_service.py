"""
services/chat_service.py
-------------------
Handles delegation of tasks related to how chats should be handled and stored.
"""
from classes import Chat, ChatMessage
from db.queries.chats import fetch_active_chat_by_id, fetch_active_chats_by_case_id, fetch_active_chats_for_user, insert_chat, update_chat_record, soft_delete_chat_by_chat_id
from db.queries.chatmessages import fetch_chat_messages_for_active_chat, insert_chat_message
from db.queries.file_processing import get_files_for_chat, get_files_for_case
from db.queries.file_text import get_file_text_chunks
from services.file_service import get_file_info_for_chat_from_db, soft_delete_file


# ========================================== #
#                   CREATE                   #
# ========================================== #
async def create_chat(chat: Chat) -> Chat | None:
  """Creates a new chat in the database and returns the created record"""
  result = await insert_chat(chat)
  if result is None:
    return None
    
  # Update the chat object with the returned values
  chat.ChatId = result.get("ChatId")
  chat.CreatedAt = result.get("CreatedAt")

  return chat


async def create_chat_message(chat_message: ChatMessage) -> ChatMessage | None:
  """Creates a new chat message in the database and returns the created record"""
  result = await insert_chat_message(chat_message)
  if result is None:
    return None
    
  # Update the chat object with the returned values
  chat_message.ChatMessageId = result.get("ChatMessageId")
  chat_message.CreatedAt = result.get("CreatedAt")

  return chat_message



# ========================================== #
#                   READ                     #
# ========================================== #
async def get_active_chat_by_id(chat_id: int) -> Chat | None:
  """Fetches a chat from the database based on the ChatId"""
  chat_data = await fetch_active_chat_by_id(chat_id)
  if chat_data is None:
    return None
  
  return Chat(**chat_data)


async def get_chats_by_case_id(case_id: int) -> list[Chat] | None:
  """Fetches all active chats from the database based on the CaseId"""
  chats_data = await fetch_active_chats_by_case_id(case_id)
  if chats_data is None:
    return None
  
  return [Chat(**chat) for chat in chats_data]


async def get_chats_by_user_id(user_id: int) -> list[Chat] | None:
  """Fetches all active chats from the database based on the UserId"""
  chats_data = await fetch_active_chats_for_user(user_id)
  if chats_data is None:
    return None
  
  return [Chat(**chat) for chat in chats_data]


async def get_chat_messages_for_chat_by_id(chat_id: int) -> list[ChatMessage] | None:
  """Fetches all chat messages for a given chat if it is active"""
  chat_messages_data = await fetch_chat_messages_for_active_chat(chat_id)
  if chat_messages_data is None:
    return None
    
  return [ChatMessage(**message) for message in chat_messages_data]



# ========================================== #
#                   UPDATE                   #
# ========================================== #
async def update_chat_db(chat: Chat) -> Chat | None:
    """Updates a chat record in the database and returns the updated record"""
    result = await update_chat_record(chat)
    if result is None:
        return None
    
    return Chat(**result)


# ========================================== #
#                   DELETE                   #
# ========================================== #
async def soft_delete_chat(chat_id: int) -> bool:
  """Soft deletes a chat and all related files"""
  chat = await get_active_chat_by_id(chat_id)
  if chat is None:
    return False
  
  result = await soft_delete_chat_by_chat_id(chat_id)
  if result is None:
    return False
  
  files_info = await get_file_info_for_chat_from_db(chat_id)
  if files_info is not None and len(files_info) > 0:
    for file_info in files_info:
      await soft_delete_file(file_info.FileId, chat.UserId)

  return True


# ========================================== #
#                  Other                     #
# ========================================== #

# Private function, don't use this elsewhere
# Builds a preview of a file's extracted text chunks (max chars = 800)
async def _build_file_preview(file_id: str, max_chars: int = 800) -> str:
  chunks = await get_file_text_chunks(file_id)
  if not chunks:
    return ""
  full_text = "\n\n".join(chunk.get("Content", "") for chunk in chunks)
  if len(full_text) <= max_chars:
    return full_text
  return full_text[:max_chars] + "\n\n[truncated]"

# Private function, don't use this elsewhere
# Formats a single file dict into a prompt line, including a preview if READY
async def _format_file_line(file: dict) -> str:
  file_id = str(file.get("FileId", ""))
  display_name = str(file.get("OriginalFilename") or "") + str(file.get("FileExtension") or "") or file_id
  status = str(file.get("Status") or "UNKNOWN")
  line = f"- {file_id}: {display_name} [{status}]"
  if file.get("ErrorMessage"):
    line += f" error={file['ErrorMessage']}"
  if status == "READY":
    preview = await _build_file_preview(file_id)
    if preview:
      line += f"\n  preview: {preview}"
  return line


# Gets the file list and instruction from the user ready before it gets sent to the LLM
async def build_file_context_prompt(user_message: str, chat_id: int | None, case_id: int | None) -> str:
  all_files: list[dict] = []
  if chat_id is not None:
    all_files.extend(await get_files_for_chat(chat_id))
  if case_id is not None:
    all_files.extend(await get_files_for_case(case_id))

  unique_files = list({str(f["FileId"]): f for f in all_files}.values())
  if not unique_files:
    return user_message

  file_lines = [await _format_file_line(f) for f in unique_files]

  return (
    f"{user_message}\n\n"
    "Attached files and previews for this conversation:\n"
    f"{chr(10).join(file_lines)}\n\n"
    "If a READY file preview already contains the needed information, answer directly from the preview. "
    "Use get_file_content(file_id) only if you need more of the document. "
    "Do not ask the user for a UUID; the file IDs are already provided in this context. "
    "If the user refers to a file by name, match that name to the listed UUID and use it directly. "
    "If a file is still processing, say so instead of asking for an ID."
  )


# ========================================== #

