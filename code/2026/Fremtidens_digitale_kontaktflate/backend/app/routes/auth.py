# Standard library
import logging

# Third-party
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

# Local
from app.database import get_db
from app.repositories.auth import (
    get_owner_login_profile_by_personnr,
    get_properties_by_orgnr,
    get_properties_by_personnr,
    get_roles_by_personnr,
)

demo = logging.getLogger("demo")

router = APIRouter()


class LoginRequest(BaseModel):
    # National identity number from the login form.
    fodselsnummer: str


class RolesRequest(BaseModel):
    personnr: str


class RoleResponse(BaseModel):
    type: str
    id: str
    label: str


@router.post("/auth/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """Resolve a fødselsnummer to an internal owner ID via matrikkel JSONB lookup.

    Args:
        body (LoginRequest): Request body with the fødselsnummer.
        db (Session): Database session injected by FastAPI.

    Returns:
        dict: {"owner_id": int, "full_name": str | None, "first_name": str | None}

    Raises:
        HTTPException: 404 if no owner matches the fødselsnummer.
    """
    # Return lightweight profile data used by the frontend header after login.
    demo.info("\U0001f7e6 BACKEND   ID-porten: innlogging for personnr ***%s", body.fodselsnummer[-4:])
    owner_profile = get_owner_login_profile_by_personnr(db, body.fodselsnummer)
    if owner_profile is None:
        demo.info("\U0001f7e6 BACKEND   \u2717 Ingen eier funnet i matrikkel-JSONB")
        raise HTTPException(status_code=404, detail="Owner not found")
    demo.info("\U0001f7e6 BACKEND   \u2713 Eier funnet (kommune %s)", owner_profile.get("bostedkommunenr"))
    return owner_profile



@router.post("/auth/roles", response_model=list[RoleResponse])
def get_roles(body: RolesRequest, db: Session = Depends(get_db)):
    """Return available roles for a person (private + orgs they represent)."""
    roles = get_roles_by_personnr(db, body.personnr)
    if not roles:
        raise HTTPException(status_code=404, detail="No roles found for this user")
    demo.info("\U0001f7e6 BACKEND   \u2713 %d roller funnet (privatperson + evt. organisasjoner)", len(roles))
    return roles


@router.get("/auth/properties")
def get_properties_by_role(
    role_type: str = Query(..., alias="role_type"),
    role_id: str = Query(..., alias="role_id"),
    db: Session = Depends(get_db),
):
    """Return properties for the active role (PERSON or ORG)."""
    role_type = role_type.upper()
    if role_type == "PERSON":
        properties = get_properties_by_personnr(db, role_id)
    elif role_type == "ORG":
        properties = get_properties_by_orgnr(db, role_id)
    else:
        raise HTTPException(status_code=400, detail="Unsupported role type")

    if not properties:
        raise HTTPException(status_code=404, detail="No properties found for this role")
    demo.info("\U0001f7e6 BACKEND   \u2713 %d eiendommer funnet for rolle %s", len(properties), role_type)
    return properties
