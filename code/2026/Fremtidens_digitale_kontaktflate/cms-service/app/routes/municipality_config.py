"""Route for municipality configuration.

Fetches municipality-specific branding, contact info, and settings from Wagtail.
Rewrites internal Wagtail media URLs to relative paths so they route through
the cms-service media proxy instead of leaking internal Docker hostnames.

Endpoint:
    GET /municipality-config/{municipality_id}  -> MunicipalityConfig (200, 404, 503)
"""

import httpx
from fastapi import APIRouter, HTTPException, Request
from app.schema.municipality_config import MunicipalityConfig

router = APIRouter()


@router.get("/municipality-config/{municipality_id}", response_model=MunicipalityConfig)
async def get_municipality_config(municipality_id: str, request: Request):
    """Fetch and return municipality config, rewriting internal media URLs."""
    client = request.app.state.wagtail_client
    try:
        data = await client.get_municipality_config(municipality_id)
        # Rewrite logo_url: Wagtail returns internal URL like
        # http://wagtail-cms:8002/media/images/foo.png
        # Rewrite to relative /media/ path so it goes through our proxy
        if data.get("logo_url") and "/media/" in data["logo_url"]:
            data["logo_url"] = "/media/" + data["logo_url"].split("/media/", 1)[1]
        return MunicipalityConfig(**data)
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise HTTPException(status_code=404, detail="Municipality not found")
        raise HTTPException(status_code=503, detail="CMS unavailable")
    except Exception:
        raise HTTPException(status_code=503, detail="CMS unavailable")
