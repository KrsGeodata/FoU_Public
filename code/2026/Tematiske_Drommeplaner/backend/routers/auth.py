import os

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status

from database.database import get_db
from schemas.auth import AdminLoginRequest, AdminUserResponse
from services.auth_service import (
    SESSION_COOKIE_NAME,
    SESSION_TTL_SECONDS,
    AdminIdentity,
    get_admin_from_session,
    login_admin,
    logout_admin,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _cookie_secure() -> bool:
    return os.getenv("COOKIE_SECURE", "false").strip().lower() in {"1", "true", "yes", "on"}


def require_admin(request: Request) -> AdminIdentity:
    session_token = request.cookies.get(SESSION_COOKIE_NAME)
    if not session_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Ikke autentisert")

    with get_db() as conn:
        return get_admin_from_session(conn, session_token)


@router.post("/login", response_model=AdminUserResponse)
def post_login(payload: AdminLoginRequest, response: Response):
    with get_db() as conn:
        session = login_admin(conn, payload.username, payload.password)

    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=session.token,
        httponly=True,
        samesite="lax",
        secure=_cookie_secure(),
        path="/",
        max_age=SESSION_TTL_SECONDS,
    )
    return AdminUserResponse(username=session.username)


@router.post("/logout")
def post_logout(request: Request, response: Response):
    session_token = request.cookies.get(SESSION_COOKIE_NAME)
    if session_token:
        with get_db() as conn:
            logout_admin(conn, session_token)

    response.delete_cookie(key=SESSION_COOKIE_NAME, samesite="lax", secure=_cookie_secure(), path="/")
    return {"ok": True}


@router.get("/me", response_model=AdminUserResponse)
def get_me(admin: AdminIdentity = Depends(require_admin)):
    return AdminUserResponse(username=admin.username)
