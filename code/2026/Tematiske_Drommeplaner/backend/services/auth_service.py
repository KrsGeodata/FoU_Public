import hashlib
import secrets
from dataclasses import dataclass

from fastapi import HTTPException, status

from database.database import dict_cursor

SESSION_COOKIE_NAME = "admin_session"
SESSION_TTL_SECONDS = 60 * 60 * 12  # 12 hours


@dataclass
class AuthSession:
    token: str
    username: str


@dataclass
class AdminIdentity:
    user_id: int
    username: str


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def login_admin(conn, username: str, password: str) -> AuthSession:
    with dict_cursor(conn) as cur:
        cur.execute(
            """
            SELECT id, username
            FROM admin_user
            WHERE username = %s
              AND is_active = TRUE
              AND password_hash = crypt(%s, password_hash)
            """,
            (username, password),
        )
        user = cur.fetchone()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Ugyldig brukernavn eller passord",
            )

        token = secrets.token_urlsafe(48)
        token_hash = _hash_token(token)

        cur.execute(
            """
            INSERT INTO admin_session (admin_user_id, token_hash, expires_at)
            VALUES (%s, %s, NOW() + (%s * INTERVAL '1 second'))
            """,
            (user["id"], token_hash, SESSION_TTL_SECONDS),
        )

        return AuthSession(token=token, username=user["username"])


def get_admin_from_session(conn, token: str) -> AdminIdentity:
    token_hash = _hash_token(token)

    with dict_cursor(conn) as cur:
        cur.execute(
            """
            SELECT u.id, u.username
            FROM admin_session s
            JOIN admin_user u ON u.id = s.admin_user_id
            WHERE s.token_hash = %s
              AND s.revoked_at IS NULL
              AND s.expires_at > NOW()
              AND u.is_active = TRUE
            """,
            (token_hash,),
        )
        user = cur.fetchone()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Ikke autentisert",
            )

        return AdminIdentity(user_id=user["id"], username=user["username"])


def logout_admin(conn, token: str) -> None:
    token_hash = _hash_token(token)
    with dict_cursor(conn) as cur:
        cur.execute(
            """
            UPDATE admin_session
            SET revoked_at = NOW()
            WHERE token_hash = %s
              AND revoked_at IS NULL
            """,
            (token_hash,),
        )
