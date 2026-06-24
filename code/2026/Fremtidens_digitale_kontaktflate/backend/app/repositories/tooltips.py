"""Repository for CMS tooltip data.

Tooltips are short help texts displayed next to info buttons in the frontend.
Each municipality can customize these through the CMS.
"""

from app.clients.cms_client import CmsClient


class TooltipsRepository:
    """Fetches tooltip texts for a given municipality.

    Usage in routes:
        repo = TooltipsRepository(client)
        tooltips = await repo.get_tooltips("4204")
    """

    def __init__(self, client: CmsClient):
        self._client = client

    async def get_tooltips(self, municipality_id: str) -> dict:
        """Get all tooltips for a municipality.

        Args:
            municipality_id: Norwegian municipality number, e.g. "4204".

        Returns:
            Dict of tooltip key-value pairs. Empty dict if municipality not found.
        """
        return await self._client.get_tooltips(municipality_id)
