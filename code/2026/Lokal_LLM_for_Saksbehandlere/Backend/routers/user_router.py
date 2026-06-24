"""
routers/user_router.py
-------------------
Declares the endpoints related to users and general user data.
"""
from fastapi import APIRouter, HTTPException, status
from db.queries.users import fetch_user_cases_and_chats_by_userid
from classes import Case, Chat, APIData, UserData

user_router = APIRouter()


@user_router.get("/users/{user_id}/dashboard", operation_id="get_user_cases_and_chats", status_code=status.HTTP_200_OK)
async def get_user_cases_and_chats(user_id: int) -> APIData:
    """Gets a users cases and chats based on the UserId"""
    if user_id is None or user_id <= 0:
      raise HTTPException(status_code=400, detail="Invalid user id")

    try:
        returnData = await fetch_user_cases_and_chats_by_userid(user_id)
    except Exception as e:
        print(f"Failed to get user data: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get user data: {e}")
    
    if returnData is None:
        raise HTTPException(status_code=404, detail="User data not found")
    
    # Initialize dictionaries to store unique cases and chats
    cases = {}
    chats = {}

    for record in returnData:

      if record["CaseId"] and record["CaseId"] not in cases:
        cases[record["CaseId"]] = Case(
        CaseId=record["CaseId"],
        UserId=record["UserId"],
        Title=record["CaseTitle"],
        Description=record["CaseDescription"],
        Status=record["Status"],
        CreatedAt=record["CaseCreatedAt"],
        IsActive=record["CaseIsActive"],
      )

      if record["ChatId"] and record["ChatId"] not in chats:
                chats[record["ChatId"]] = Chat(
                    ChatId=record["ChatId"],
                    CaseId=record["ChatCaseId"],
                    UserId=record["ChatUserId"],
                    Title=record["ChatTitle"],
                    Description=record["ChatDescription"],
                    CreatedAt=record["ChatCreatedAt"],
                    IsActive=record["ChatIsActive"],
                )
            
    return APIData(
      User=UserData(UserId=user_id),
      Cases=list(cases.values()),
      Chats=list(chats.values()),
    )