"""
services/file_service.py
----------------
Handles delegation of tasks related to how files should be handled and stored.
"""

import asyncio
import uuid
import os
from pathlib import Path

from fastapi import UploadFile, HTTPException
from dotenv import load_dotenv

from services.storage_service import store_file_to_disk, retrieve_file_from_disk, delete_file_from_disk, get_file_stream, does_file_exist
from db.queries.files import fetch_file_info_by_chat_id, fetch_file_info_by_case_id, fetch_file_info_by_uuid, soft_delete_file_by_file_id, insert_file
from db.queries.file_processing import insert_file_processing, update_file_processing_status
from db.queries.file_text import insert_file_text_chunk
from constants import ALLOWED_FILE_TYPES, MAX_FILE_SIZE
from classes import FilesInfo

load_dotenv()
storage_dir = os.getenv("STORAGE_DIR", "./local_storage")
storage_environment = os.getenv("STORAGE_ENVIRONMENT")

CHUNK_CHAR_SIZE = 4000


def _chunk_text(text: str) -> list[str]:
    return [text[i:i + CHUNK_CHAR_SIZE] for i in range(0, len(text), CHUNK_CHAR_SIZE)]


async def _extract_text(file_path: Path, extension: str) -> str | None:
    """Extract plain text from a file. Returns None for unsupported types (e.g. images)."""
    ext = extension.lower()

    if ext in (".txt", ".md", ".json", ".csv"):
        return await asyncio.to_thread(
            lambda: file_path.read_text(encoding="utf-8", errors="replace")
        )

    if ext == ".pdf":
        def _read_pdf():
            import pdfplumber
            parts = []
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        parts.append(text)
            return "\n\n".join(parts) or None
        return await asyncio.to_thread(_read_pdf)

    if ext == ".docx":
        def _read_docx():
            from docx import Document
            doc = Document(str(file_path))
            parts = [p.text for p in doc.paragraphs if p.text.strip()]
            return "\n\n".join(parts) or None
        return await asyncio.to_thread(_read_docx)

    return None


# ========================================== #
#                   CREATE                   #
# ========================================== #
async def upload_file(user_id: int, new_file: UploadFile, case_id: int = None, chat_id: int = None, chat_message_id: int = None) -> FilesInfo | None:
  """Store a file to the filesystem, persist metadata, and extract text synchronously."""
  original_filename = new_file.filename
  file_extension = Path(original_filename).suffix
  original_filename_without_extension = original_filename.replace(file_extension, "")

  new_uuid = uuid.uuid4()
  new_file.filename = f"{new_uuid}{file_extension}"

  try:
    uploadResult = await store_file_to_disk(user_id, "raw", new_file)
  except Exception as e:
    raise Exception(f"Failed to write to the disk: {e}")

  if not uploadResult:
    raise Exception("Failed to write to the disk")

  upload_file_info = FilesInfo(
    FileId=new_uuid,
    UserId=user_id,
    OriginalFilename=original_filename_without_extension,
    FileExtension=file_extension,
    CaseId=case_id,
    ChatId=chat_id,
    ChatMessageId=chat_message_id
  )

  try:
    result = await insert_file(upload_file_info, storage_environment)
  except Exception as e:
    delete_file_from_disk(user_id, "raw", new_file.filename)
    raise Exception(f"Failed to insert to database: {e}")

  if not result:
    raise Exception("Failed to insert to database")

  if not new_uuid == result.get("FileId"):
    raise Exception("File IDs don't match")

  file_id_str = str(new_uuid)
  await insert_file_processing(file_id_str)

  raw_path = Path(storage_dir) / "raw" / storage_environment / f"user_{user_id}" / new_file.filename
  try:
    await update_file_processing_status(file_id_str, "PROCESSING")
    text = await _extract_text(raw_path, file_extension)
    if text:
      for i, chunk in enumerate(_chunk_text(text)):
        await insert_file_text_chunk(file_id_str, i, chunk)
    await update_file_processing_status(file_id_str, "READY")
  except Exception as e:
    await update_file_processing_status(file_id_str, "FAILED", str(e))

  return FilesInfo(**result)


# ========================================== #
#                   READ                     #
# ========================================== #
async def get_file(user_id: int, uuid: str):
  """Returns a file based on user_id and uuid"""
  # See if that file exists in the db with the current storage_environment
  try:
    file_info = await fetch_file_info_by_uuid(uuid, storage_environment)
  
  except Exception as e:
    raise Exception(f"Failed to get data from db: {e}")

  if file_info is None:
     raise Exception("File not found")

  # Check the filesystem if the file exists where we say it does
  filename = f"{file_info.get("FileId")}{file_info.get("FileExtension")}"

  try:
     return_file_stream = get_file_stream(user_id, "raw", filename)
  except Exception as e:
    raise Exception(f"File not found: {e}")

  return return_file_stream, file_info


async def get_file_info_for_case_from_db(case_id: int) -> list[FilesInfo] | None:
  """Get all FileInfos related to a case at the current storage_environment"""
  try:
    case_files_info_data = await fetch_file_info_by_case_id(case_id, storage_environment)
  except Exception as e:
    raise Exception("Failed to get file info from database: {e}")

  if case_files_info_data is None:
    return None

  return [FilesInfo(**files_info) for files_info in case_files_info_data]


async def get_file_info_for_chat_from_db(chat_id: int) -> list[FilesInfo] | None:
  """Get all FileInfos related to a chat at the current storage_environment"""
  try:
    chat_files_info_data = await fetch_file_info_by_chat_id(chat_id, storage_environment)
  except Exception as e:
    raise Exception("Failed to get file info from database: {e}")
  
  if chat_files_info_data is None:
    return None
  
  return [FilesInfo(**files_info) for files_info in chat_files_info_data]



# ========================================== #
#                   UPDATE                   #
# ========================================== #



# ========================================== #
#                   DELETE                   #
# ========================================== #
async def soft_delete_file(uuid: str, user_id: int) -> bool:
  """Soft deletes a file by setting IsActive to False in the database and deleting the file from disk"""
  try:
    result = await soft_delete_file_by_file_id(uuid, user_id, storage_environment)
  except Exception as e:
    raise Exception(f"Failed to delete file: {e}")
  
  if result is None:
    return False
  
  filename = f"{result.get('FileId')}{result.get('FileExtension')}"
  try:
    delete_file_from_disk(user_id, "raw", filename)
  except Exception as e:
    print(f"Failed to delete file from disk: {e}")

  return True
    

async def delete_file_from_disk_and_db(user_id: int, uuid: str) -> bool:
  """
  Delete file from disk and soft-delete in DB.
  """
  try:
    file_record = await fetch_file_info_by_uuid(uuid, storage_environment)
  except Exception as e:
    raise RuntimeError(f"Failed to fetch file metadata: {e}") from e

  if file_record is None:
    return False

  filename = (f"{file_record['FileId']}{file_record['FileExtension']}")

  file_exists = does_file_exist(user_id, "raw", filename)

  if file_exists:
    try:
      deleted = delete_file_from_disk(user_id, "raw", filename)
    except Exception as e:
      raise RuntimeError(f"Failed to delete file from disk: {e}") from e

    if not deleted:
      raise RuntimeError("Disk deletion returned False")

  try:
    db_record = await soft_delete_file_by_file_id(uuid, user_id, storage_environment)
  except Exception as e:
    raise RuntimeError(f"Failed to soft delete DB record: {e}") from e

  if db_record is None:
    raise RuntimeError("Nothing deleted from database")

  return True


async def delete_file_from_disk_and_db_by_case_or_chat(user_id: int, case_id: int = None, chat_id: int = None): 
  """Deletes/Deactivates all files related to a case or chat"""
  # Get all files related to a case and then delete them
  if case_id is not None and case_id > 0:
    try:
      case_records = await fetch_file_info_by_case_id(case_id, storage_environment)
    except Exception as e:
      raise Exception(f"Failed to get file info for case: {e}")
    
    try:
      for record in case_records:
        await delete_file_from_disk_and_db(user_id, record.get("FileId"))
    except Exception as e:
      raise Exception(f"Failed to delete file from disk and db: {e}")
  

  # Get all files related to a chat and then delete them
  if chat_id is not None and chat_id > 0:
    try:
      chat_records = await fetch_file_info_by_chat_id(chat_id, storage_environment)
    except Exception as e:
      raise Exception(f"Failed to get file info for case: {e}")
    
    try:
      for record in chat_records:
        await delete_file_from_disk_and_db(user_id, record.get("FileId"))
    except Exception as e:
      raise Exception(f"Failed to delete file from disk and db: {e}")
    


# ========================================== #
#                   OTHER                    #
# ========================================== #
async def validate_file_basic(file: UploadFile) -> None:
    """Checks if file is of an allowed size, extension and mime type"""
    # Check file size
    # UploadFile doesn't give size directly, so we read and check
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File exceeds maximum size of 20MB")

    # Put the cursor back so the file can be read again later
    await file.seek(0)

    # Check Content-Type header and extension
    ext = Path(file.filename).suffix.lower()
    mime = file.content_type

    if (ext, mime) not in ALLOWED_FILE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type combination {ext} / {mime} is not permitted"
        )


# ========================================== #