"""Route for proxying media files from Wagtail.

Streams binary media (images, documents) from Wagtail CMS through cms-service,
so that no layer above ever needs direct access to the Wagtail container.

Endpoint:
    GET /media/{path}  -> binary stream (200, 404, 503)
"""

import httpx
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse

router = APIRouter()


@router.get("/media/{path:path}")
async def proxy_media(path: str, request: Request):
    """Stream a media file from Wagtail to the client."""
    client = request.app.state.wagtail_client
    try:
        response = await client.get_media(path)
        return StreamingResponse(
            content=response.iter_bytes(),
            media_type=response.headers.get("content-type", "application/octet-stream"),
        )
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise HTTPException(status_code=404, detail="Media not found")
        raise HTTPException(status_code=503, detail="CMS unavailable")
    except Exception:
        raise HTTPException(status_code=503, detail="CMS unavailable")
