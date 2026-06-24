"""
routers/cases_router.py
-------------------
Declares the endpoints related to cases.

Endpoints:
    POST    /cases                     -> create a new case
    GET     /cases/{case_id}           -> get a case by its CaseId
    GET     /cases/user/{user_id}      -> get all cases related to a user
    GET     /cases/{case_id}/chats     -> get all chats related to a case
    PUT     /cases/{case_id}           -> update a case by its CaseId
    DELETE  /cases/{case_id}           -> delete a case by its CaseId and all related files from disk
"""
from fastapi import APIRouter, HTTPException, status, BackgroundTasks
from classes import Case, Chat
from services.file_service import delete_file_from_disk_and_db_by_case_or_chat
from services.case_service import create_case, get_case_by_id, get_cases_by_user_id, update_case_db, soft_delete_case
from services.chat_service import get_chats_by_case_id

cases_router = APIRouter()


# ========================================== #
#           CREATE - ENDPOINTS               #
# ========================================== #
@cases_router.post("/cases", operation_id="upload_case", status_code=status.HTTP_201_CREATED)
async def upload_case(case: Case) -> Case:
  """Creates a new case in the database"""
  if case.CaseId is not None and case.CaseId != 0:
    raise HTTPException(status_code=400, detail="CaseId must be null or 0 when creating a new case")
  
  if case.UserId is None or case.UserId <= 0:
    raise HTTPException(status_code=400, detail="UserId must be a positive integer")
  
  try:
    uploaded_case = await create_case(case)
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Failed to create case: {e}")
  
  if not uploaded_case:
    raise HTTPException(status_code=500, detail="Failed to create case")
  return uploaded_case


# ========================================== #
#           READ - ENDPOINTS                 #
# ========================================== #
@cases_router.get("/cases/{case_id}", operation_id="get_case", status_code=status.HTTP_200_OK)
async def get_case(case_id: int) -> Case:
  """Gets a case based on the CaseId"""
  try:
    case = await get_case_by_id(case_id)
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Failed to get case: {e}")
  
  if not case:
    raise HTTPException(status_code=500, detail="Failed to get case")

  return case


@cases_router.get("/cases/user/{user_id}", operation_id="get_user_cases", status_code=status.HTTP_200_OK)
async def get_user_cases(user_id: int) -> list[Case]:
  """Gets cases related to a user based on the UserId"""
  if user_id is None or user_id <= 0:
      raise HTTPException(status_code=400, detail="Invalid user id")
  
  try:
    cases = await get_cases_by_user_id(user_id)
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Failed to get cases: {e}")
  
  if cases is None:
    raise HTTPException(status_code=404, detail="Cases not found for user")

  return cases


@cases_router.get("/cases/{case_id}/chats", operation_id="get_case_chats", status_code=status.HTTP_200_OK)
async def get_case_chats(case_id: int) -> list[Chat]:
  """Gets chats related to a case based on the CaseId"""
  if case_id is None or case_id <= 0:
      raise HTTPException(status_code=400, detail="Invalid case id")
  
  try:
    chats = await get_chats_by_case_id(case_id)
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Failed to get chats: {e}")
  
  if chats is None:
    raise HTTPException(status_code=404, detail="Chats not found for case")
  
  return chats



# ========================================== #
#           UPDATE - ENDPOINTS               #
# ========================================== #
@cases_router.put("/cases/{case_id}", operation_id="update_case", status_code=status.HTTP_200_OK)
async def update_case(case_id: int, case: Case) -> Case:
  """Updates a case in the database based on the CaseId"""
  if case.CaseId != case_id:
    raise HTTPException(status_code=400, detail="CaseId in path and body do not match")
  
  try:
    updated_case = await update_case_db(case)
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Failed to update case: {e}")
  
  if updated_case is None:
    raise HTTPException(status_code=500, detail="Failed to update case")
  
  return updated_case



# ========================================== #
#           DELETE - ENDPOINTS               #
# ========================================== #
@cases_router.delete("/cases/{case_id}", operation_id="delete_case", status_code=status.HTTP_204_NO_CONTENT)
async def delete_case(case_id: int):
  """Deletes a case from the database and all its related files and chats from the disk based on the CaseId"""
  if case_id is None or case_id <= 0:
    raise HTTPException(status_code=400, detail="Invalid case id")
  
  try:
    success = await soft_delete_case(case_id)
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Failed to delete case: {e}")
  
  if not success:
    raise HTTPException(status_code=500, detail="Failed to delete case")

  return success

# ========================================== #