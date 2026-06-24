"""
services/case_service.py
-------------------
Handles delegation of tasks related to how cases should be handled and stored.
"""
from classes import Case, CaseStatus

from db.queries.cases import fetch_case_by_id, insert_case, fetch_active_cases_for_user, update_case_record, soft_delete_case_by_case_id
from services.chat_service import get_chats_by_case_id, soft_delete_chat
from services.file_service import get_file_info_for_case_from_db, soft_delete_file

# ========================================== #
#                   CREATE                   #
# ========================================== #
async def create_case(case: Case) -> Case | None:
    """Creates a new case in the database and returns the created record"""
    result = await insert_case(case)
    if result is None:
        return None
    
    # Update the case object with the returned values
    case.CaseId = result.get("CaseId")
    case.CreatedAt = result.get("CreatedAt")
    case.Status = CaseStatus.Active

    return case


# ========================================== #
#                   READ                     #
# ========================================== #
async def get_case_by_id(case_id: int) -> Case | None:
    """Fetches a case from the database based on the CaseId"""
    case_data = await fetch_case_by_id(case_id)
    if case_data is None:
        return None
    
    return Case(**case_data)


async def get_cases_by_user_id(user_id: int) -> list[Case] | None:
    """Fetches all active cases for a given user"""
    cases_data = await fetch_active_cases_for_user(user_id)
    if cases_data is None:
        return None
    
    return [Case(**case) for case in cases_data]



# ========================================== #
#                   UPDATE                   #
# ========================================== #
async def update_case_db(case: Case) -> Case | None:
    """Updates a case record in the database and returns the updated record"""
    result = await update_case_record(case)
    if result is None:
        return None
    
    return Case(**result)


# ========================================== #
#                   DELETE                   #
# ========================================== #
async def soft_delete_case(case_id: int) -> bool:
  """Soft deletes a case and all related chats and files"""
  case = await get_case_by_id(case_id)
  if case is None:
    return False
  
  result = await soft_delete_case_by_case_id(case_id)
  if result is None:
    return False
  
  chats = await get_chats_by_case_id(case_id)
  if chats is not None and len(chats) > 0:
    for chat in chats:
      if chat.ChatId is not None:
        await soft_delete_chat(chat.ChatId)
  
  files_info = await get_file_info_for_case_from_db(case_id)
  if files_info is not None and len(files_info) > 0:
    for file_info in files_info:
      await soft_delete_file(file_info.FileId, file_info.UserId)

  return True


# ========================================== #
#                   OTHER                    #
# ========================================== #



# ========================================== #