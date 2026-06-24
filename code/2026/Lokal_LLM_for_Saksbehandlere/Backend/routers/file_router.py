"""
routers/file_router.py
-------------------
Declares the endpoints related to files and FilesInfo.
Endpoints:
    POST    /files/upload              -> upload a file related to a case or chat
    GET     /files/{user_id}/{uuid}    -> get a file based on user_id and the files uuid
    GET     /files/info/case/{case_id} -> get the FilesInfo related to a case
    GET     /files/info/chat/{chat_id} -> get the FilesInfo related to a chat
    DELETE  /files/{user_id}/{uuid}    -> delete a file based on user_id and the files uuid

"""
from fastapi import APIRouter, UploadFile, HTTPException, Form, status
from fastapi.responses import StreamingResponse
from services.file_service import upload_file, get_file, delete_file_from_disk_and_db, validate_file_basic, get_file_info_for_chat_from_db, get_file_info_for_case_from_db, soft_delete_file
from classes import FilesInfo
import mimetypes


# ========================================== #
#           Constants and Variables          #
# ========================================== #
file_router = APIRouter()


# ========================================== #
#           CREATE - ENDPOINTS               #
# ========================================== #
@file_router.post("/files/upload", operation_id="upload_file_enpoint", status_code=status.HTTP_201_CREATED)
async def upload_file_endpoint(user_id: int = Form(...), case_id: int = Form(None), chat_id: int = Form(None), chat_message_id: int = Form(None), file: UploadFile | None = None) -> FilesInfo | None:
  """Upload a file to the server"""
  # Set the values to None to prevent a foreign key error
  if case_id == 0:
    case_id = None
  
  if chat_id == 0:
    chat_id = None

  if chat_message_id == 0:
    chat_message_id = None

  if (case_id is None or 0) and ((chat_id is None or 0) and (chat_message_id is None or 0)):
    raise HTTPException(status_code=400, detail="File not related to any case or chat")
  
  if not file:
    raise HTTPException(status_code=400, detail="No file sent")
  
  # Check if file Extenion, mime type and file size are within the whitelist
  await validate_file_basic(file)

  # Save file to disk and properties to db, returns FilesInfo object if successful
  uploaded_file_info = await upload_file(user_id, file, case_id, chat_id, chat_message_id)
  if uploaded_file_info is None:
    raise HTTPException(status_code=500, detail="Internal Server Error")

  return uploaded_file_info


# ========================================== #
#           READ - ENDPOINTS                 #
# ========================================== #
@file_router.get("/files/{user_id}/{uuid}", operation_id="get_file_for_user", status_code=status.HTTP_200_OK)
async def get_file_for_user(user_id: int, uuid: str) -> StreamingResponse:
  """Gets a file for a user based on UserId and the files UUID"""
  try:
    file_stream, file_info = await get_file(user_id, uuid)
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Failed to get the requested file: {e}")
  
  if file_stream is None or file_info is None:
    raise HTTPException(status_code=404, detail="File not found")
  
  media_type, _ = mimetypes.guess_type(f"file{file_info.get("FileExtension")}")

  return StreamingResponse(
    content=file_stream,
    media_type=media_type,
    headers={
      "Content-Disposition": f'attachement; filename="{file_info.get("OriginalFilename")}{file_info.get("FileExtension")}"'
    }
  )


@file_router.get("/files/info/case/{case_id}", operation_id="get_file_info_for_case", status_code=status.HTTP_200_OK)
async def get_file_info_for_case(case_id: int) -> list[FilesInfo]:
  """Get the FilesInfo related to a case"""
  if case_id is None or case_id <= 0:
      raise HTTPException(status_code=400, detail="Invalid case id")
  
  try:
    file_infos = await get_file_info_for_case_from_db(case_id)
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Failed to get the requested file information: {e}")

  if file_infos is None:
    raise HTTPException(status_code=404, detail=f"Files not found for case id")

  return file_infos


@file_router.get("/files/info/chat/{chat_id}", operation_id="get_file_info_for_chat", status_code=status.HTTP_200_OK)
async def get_file_info_for_chat(chat_id: int) -> list[FilesInfo]:
  """Get the FilesInfo related to a chat"""
  if chat_id is None or chat_id <= 0:
      raise HTTPException(status_code=400, detail="Invalid chat id")
  
  try:
    file_infos = await get_file_info_for_chat_from_db(chat_id)
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Failed to get the requested file information: {e}")

  if file_infos is None:
    raise HTTPException(status_code=500, detail=f"Failed to get the requested file information")

  return file_infos

# ========================================== #
#           UPDATE - ENDPOINTS               #
# ========================================== #



# ========================================== #
#           DELETE - ENDPOINTS               #
# ========================================== #
@file_router.delete("/files/{user_id}/{uuid}", operation_id="delete_file_endpoint", status_code=status.HTTP_200_OK)
async def delete_file_endpoint(user_id: int, uuid: str) -> bool:
  """Deletes a file based on user_id and filename -> change to FileId/UUID"""
  try:
    response = await soft_delete_file(uuid, user_id)
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Failed to delete file: {e}")
  
  if not response:
    raise HTTPException(status_code=404, detail="File not found or already deleted")
  
  return response


# ========================================== #