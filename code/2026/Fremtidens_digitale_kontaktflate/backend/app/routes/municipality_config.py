"""Routes for municipality configuration.

Serves municipality-specific branding, contact info, and settings to the
frontend. The default municipality (DEFAULT_MUNICIPALITY env var) is used
when no municipality_id is provided — typically on the login page before
a property has been selected.

Endpoints:
    GET /municipality-config/          -> default municipality config
    GET /municipality-config/{id}      -> config for a specific municipality
"""

# Third-party
import os
from fastapi import APIRouter, Depends, HTTPException

# Local
from app.clients.cms_client import CmsClient
from app.dependencies import get_cms_client
from app.repositories.municipality_config import MunicipalityConfigRepository

DEFAULT_MUNICIPALITY = os.getenv("DEFAULT_MUNICIPALITY", "4204")

router = APIRouter()


@router.get("/municipality-config/")
async def get_default_municipality_config(client: CmsClient = Depends(get_cms_client)):
    """Return configuration for the default municipality (e.g. Kristiansand 4204)."""
    repo = MunicipalityConfigRepository(client)
    config = await repo.get_config(DEFAULT_MUNICIPALITY)
    if not config:
        raise HTTPException(status_code=404, detail="Municipality not found")
    return config


@router.get("/municipality-config/{municipality_id}")
async def get_municipality_config(municipality_id: str, client: CmsClient = Depends(get_cms_client)):
    """Return configuration for a specific municipality by its number."""
    repo = MunicipalityConfigRepository(client)
    config = await repo.get_config(municipality_id)
    if not config:
        raise HTTPException(status_code=404, detail="Municipality not found")
    return config
