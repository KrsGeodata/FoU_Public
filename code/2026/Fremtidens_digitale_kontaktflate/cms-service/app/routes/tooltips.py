"""Route for CMS tooltip texts.

Extracts the tooltips sub-object from a municipality's Wagtail config.
Tooltips are short help texts shown next to info buttons in the frontend.

Endpoint:
    GET /tooltips/{municipality_id}  -> dict[str, str] (200, 404, 503)
"""

import logging

import httpx
from fastapi import APIRouter, HTTPException, Request

logger = logging.getLogger("demo")

router = APIRouter()


@router.get("/tooltips/{municipality_id}", response_model=dict[str, str])
async def get_tooltips(municipality_id: str, request: Request):
    """Fetch municipality config from Wagtail and return only the tooltips."""
    client = request.app.state.wagtail_client
    try:
        logger.info("\U0001f7e7 CMS       \u2192 Wagtail: henter config for kommune %s", municipality_id)
        data = await client.get_municipality_config(municipality_id)
        tooltips = data.get("tooltips", {})
        logger.info("\U0001f7e7 CMS       \u2713 Wagtail svarte: %d tooltips hentet", len(tooltips))
        return tooltips
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise HTTPException(status_code=404, detail="Municipality not found")
        raise HTTPException(status_code=503, detail="CMS unavailable")
    except Exception:
        raise HTTPException(status_code=503, detail="CMS unavailable")
