"""Routes for general CMS content (tooltips, media).

These endpoints proxy CMS data from cms-service to the frontend.
The frontend never talks to cms-service directly — all requests go
through the backend.

Endpoints:
    GET /cms/tooltips           -> tooltip texts for the default municipality
    GET /cms/media/{path}       -> proxy media files (images, documents) from CMS
"""

# Third-party
import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

# Local
from app.clients.cms_client import CmsClient
from app.dependencies import get_cms_client
from app.repositories.tooltips import TooltipsRepository

DEFAULT_MUNICIPALITY = os.getenv("DEFAULT_MUNICIPALITY", "4204")

router = APIRouter(prefix="/cms")


@router.get("/tooltips")
async def get_tooltips(client: CmsClient = Depends(get_cms_client)):
    """Return tooltip texts for info buttons, using the default municipality."""
    repo = TooltipsRepository(client)
    try:
        return await repo.get_tooltips(DEFAULT_MUNICIPALITY)
    except Exception:
        raise HTTPException(status_code=503, detail="CMS unavailable")


@router.get("/media/{path:path}")
async def proxy_media(path: str, client: CmsClient = Depends(get_cms_client)):
    """Stream a media file from cms-service to the client.

    This avoids exposing cms-service directly to the frontend.
    The response is streamed to avoid loading large files into memory.
    """
    try:
        response = await client.get_media(path)
        return StreamingResponse(
            content=response.iter_bytes(),
            media_type=response.headers.get("content-type", "application/octet-stream"),
        )
    except Exception:
        raise HTTPException(status_code=503, detail="CMS unavailable")


@router.get("/page-content/{slug}")
async def get_page_content(slug: str):
    """Return static page content (title, intro, info section) for a given slug.

    Example slugs: byggesak, naboliste, avfall, avgifter.
    Returns all fields as null if the slug has no content entry (not 404).
    Currently a stub — returns empty content until Wagtail PageContent model (#192) is done.
    """
    # Stub response until cms-service page-content endpoint is fully implemented (#192)
    return {
        "slug": slug,
        "page_title": None,
        "intro_text": None,
        "info_section_body": None,
    }
