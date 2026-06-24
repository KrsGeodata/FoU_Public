"""Route for CMS page content.

Stub endpoint — returns empty response until Wagtail PageContent model
is implemented in #192.

Endpoint:
    GET /page-content/{slug}  -> PageContentResponse (200)
"""

from fastapi import APIRouter
from app.schema.page_content import PageContentResponse

router = APIRouter()


@router.get("/page-content/{slug}", response_model=PageContentResponse)
async def get_page_content(slug: str):
    """Return page content by slug. Currently a stub returning empty fields."""
    return PageContentResponse(slug=slug)
