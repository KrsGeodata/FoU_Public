"""
main.py
-------
FastAPI application entry point.

Mounts the FastMCP server and exposes HTTP endpoints for the WinUI frontend to call.

Run locally:
    uvicorn main:app --reload

Endpoints:
    GET  /               -> health check
    GET  /health/db      -> database connectivity check
    GET  /health/db/mock -> query helper testing
    POST /auth/login     -> database-backed login check
    POST /chat           -> main chatting endpoint
    POST /chat2          -> new version of the chat endpoint
"""

from contextlib import asynccontextmanager
import bcrypt
import logging
from fastapi import FastAPI, HTTPException, Form, UploadFile, Depends
from fastmcp.utilities.lifespan import combine_lifespans
from fastmcp_server import mcp
from agents.agents import agent
from classes import ChatRequest, LoginRequest, APIData, Case, UserData, Chat, ChatMessage, ChatRequestv2, FilesInfo, ChatResponse
from routers import all_routers
import httpx
import os
import db
from db.queries import DatabaseQueryError
from db.queries.users import get_user_by_email
from dotenv import load_dotenv


from services.chat_service import get_chat_messages_for_chat_by_id, build_file_context_prompt, create_chat_message
from services.converter_service import modelmessage_to_chatmessage, chatmessage_to_modelmessage
from services.file_service import validate_file_basic, upload_file

load_dotenv()

logger = logging.getLogger("backend.chat")
if not logger.handlers:
    logging.basicConfig(level=logging.INFO)

# --- FastAPI and FastMCP mounting ---
mcp_app = mcp.http_app(path="/") # references mcp server defined in fastmcp_server.py

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage FastAPI lifecycle"""
    try:
        await db.connect()
        app.state.http = httpx.AsyncClient(timeout=30.0)
       
        yield
    finally:
        await app.state.http.aclose()
        await db.disconnect()

app = FastAPI(
    title="Lokal LLM Backend",
    description="Backend API for the Lokal LLM WinUI application",
    lifespan=combine_lifespans(lifespan, mcp_app.lifespan))

# Mount all routers to app
for router in all_routers:
    app.include_router(router)

app.mount("/mcp", mcp_app)

@app.get("/", operation_id="health_check")
def health_check():
    """Health check to confirm server is running"""
    return {"status": "ok"}

@app.get("/health/db", operation_id="db_health_check")
async def db_health():
    """Check database connectivity by running a simple query"""
    pool = db.get_pool()
    async with pool.acquire() as conn:
        result = await conn.fetchval("SELECT 1")
    return {"db": "ok", "result": result}


@app.post("/auth/login", operation_id="auth_login")
async def auth_login(request_body: LoginRequest):
    """Validate user credentials against User table."""
    user = await get_user_by_email(str(request_body.email))
    if not user or user.get("IsActive") is False:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    password_hash = user.get("Password_hash")
    if not password_hash:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    try:
        is_valid = bcrypt.checkpw(
            request_body.password.encode("utf-8"),
            str(password_hash).encode("utf-8"),
        )
    except ValueError:
        raise HTTPException(status_code=500, detail="Stored password hash is invalid")

    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "ok": True,
        "user": {
            "id": user.get("UserId"),
            "name": user.get("Name"),
            "email": user.get("Email"),
        },
    }


@app.post("/chat", operation_id="chat")
async def handle_chat_message(request_body: ChatRequest):
    logger.info("Chat request received: %s", request_body.message)
    try:
        prompt = await build_file_context_prompt(request_body.message, request_body.chat_id, request_body.case_id)

        message_history = []
        if request_body.chat_id is not None:
            db_messages = await get_chat_messages_for_chat_by_id(request_body.chat_id)
            if db_messages:
                message_history = [chatmessage_to_modelmessage(m) for m in db_messages]

        result = await agent.run(prompt, message_history=message_history)
        logger.info("Chat response received")
        return {"text": getattr(result, "output", None) or getattr(result, "data", "") or ""}
    except Exception as e:
        logger.exception("Chat request failed")
        return {"text": f"There is something wrong with the LLM and the error is: {e}"}



def parse_chat_request(request_body: str = Form(...)) -> ChatRequestv2:
    return ChatRequestv2.model_validate_json(request_body)

@app.post("/chat2", operation_id="chat2")
#async def handle_chat_message_v2(request_body: ChatRequest2):
async def handle_chat_message_v2(request_body: ChatRequestv2 = Depends(parse_chat_request), files: list[UploadFile] | None = None) -> ChatResponse:
    """New chat endpoint that accepts file attachments along with the message"""
    logger.info(f"Chat request received: {request_body.chat_message.MessageText}")

    # === Step 1: Validate input === #
    if request_body.user_id is None or request_body.user_id <= 0:
        logger.exception("Invalid user id")
        raise HTTPException(status_code=400, detail="Invalid user id")

    if (not request_body.chat_message) or (not request_body.chat_message.ChatId) or (request_body.chat_message.ChatId != request_body.chat_id) or (not request_body.chat_message.MessageText) or (request_body.chat_message.IsUserMessage is False) or (request_body.chat_message.IsUserMessage is None):
        logger.exception("Missing required chat message fields")
        raise HTTPException(status_code=400, detail="Missing required chat message fields")
    
    if files and len(files) > 5:
        logger.exception("Too many files attached. Maximum is 5")
        raise HTTPException(status_code=400, detail="Too many files attached. Maximum is 5.")
    
    if files:
        for f in files:
            await validate_file_basic(f)
    
    # Declare the return variable so we can return partial data in errors happen somewhere in the middle
    chat_response = ChatResponse()


    # === Step 2: Save message to DB === #
    try:
        uploaded_message = await create_chat_message(request_body.chat_message)
    except Exception as e:
        logger.exception("Failed to save chat message to DB")
        raise HTTPException(status_code=500, detail=f"Failed to save chat message: {e}")
    
    if (uploaded_message is None) or (uploaded_message.ChatMessageId is None or 0):
        logger.exception("Failed to save chat message to DB")
        raise HTTPException(status_code=500, detail="Failed to save chat message to DB")
    
    logger.info(f"Uploaded message ChatMessageId: {uploaded_message.ChatMessageId}")
    chat_response.UserMessage = uploaded_message


    # === Step 3: Upload files to storage and metadata to DB === #
    uploaded_files_info = []
    for file in files or []:
        try:
            uploaded_file_info = await upload_file(request_body.user_id, file, case_id = None, chat_id = request_body.chat_id, chat_message_id=uploaded_message.ChatMessageId)
            if uploaded_file_info:
                uploaded_files_info.append(uploaded_file_info)
        except Exception as e:
            logger.exception("Failed to upload file")
            raise HTTPException(status_code=500, detail=f"Failed to upload file {file.filename}: {e}")

    chat_response.FilesInfos = uploaded_files_info


    #  === Step 4: Call AI (await agent.run) with message and file context === #
    agent_response = ""
    try:
        prompt = await build_file_context_prompt(uploaded_message.MessageText, request_body.chat_id, request_body.case_id)

        message_history = []
        if request_body.chat_id is not None:
            db_messages = await get_chat_messages_for_chat_by_id(request_body.chat_id)
            if db_messages:
                message_history = [chatmessage_to_modelmessage(m) for m in db_messages]

        result = await agent.run(prompt, message_history=message_history)
        logger.info("Chat response received")
        
        agent_response = getattr(result, "output", None) or getattr(result, "data", "") or ""
        logger.info(f"Agent response is: {agent_response}")
    except Exception as e:
        logger.exception(f"Chat request failed, and the error is: {e}")
        agent_response = f"There is something wrong with the LLM and the error is: {e}"

    if agent_response is None or agent_response == "":
        logger.info("Agent response returned nothing")
        return chat_response


    # === Step 5: Save AI response to DB === #
    agent_response_message = ChatMessage(
        MessageText = agent_response,
        ChatId = request_body.chat_id,
        IsUserMessage = False
    )
    logger.info(f"agent_response_message: {agent_response_message}")
    try:
        saved_agent_response_message = await create_chat_message(agent_response_message)
    except Exception as e:
        logger.exception(f"Failed to upload agent_response to db: {e}")
        return chat_response
    logger.info(f"saved_agent_response_message: {saved_agent_response_message}")

    if (saved_agent_response_message is None) or (saved_agent_response_message.ChatMessageId is None or 0):
        logger.exception("Failed to save agent response message to DB")
        return chat_response

    # Step 6: Return 200 + full response including any new message ID and file metadata for frontend to associate attachments with the correct message. 
    logger.info(f"Agent response message ChatMessageId: {saved_agent_response_message.ChatMessageId}")
    chat_response.AIResponse = saved_agent_response_message
    return chat_response