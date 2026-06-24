"""Repository for CMS page content.

Provides access to full CMS pages (e.g. "about", "privacy-policy") that are
managed through the Wagtail admin and served via cms-service.
"""

from app.clients.cms_client import CmsClient


class PageContentRepository:
    """Fetches CMS page content by slug.

    Usage in routes:
        repo = PageContentRepository(client)
        page = await repo.get_page_content("about")
    """

    def __init__(self, client: CmsClient):
        self._client = client

    async def get_page_content(self, slug: str) -> dict | None:
        """Get page content by its URL slug.

        Args:
            slug: The page's URL slug, e.g. "about" or "privacy-policy".

        Returns:
            Page content dict, or None if no page exists with that slug.
        """
        return await self._client.get_page_content(slug)
