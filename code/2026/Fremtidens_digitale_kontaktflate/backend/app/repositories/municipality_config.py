"""Repository for municipality configuration data.

Provides a thin layer between routes and CmsClient, following the same
repository pattern used throughout the backend (see app/repositories/).
"""

from app.clients.cms_client import CmsClient


class MunicipalityConfigRepository:
    """Fetches municipality-specific configuration (branding, contact info, etc.).

    Usage in routes:
        repo = MunicipalityConfigRepository(client)
        config = await repo.get_config("4204")
    """

    def __init__(self, client: CmsClient):
        self._client = client

    async def get_config(self, municipality_id: str) -> dict | None:
        """Get configuration for a municipality.

        Args:
            municipality_id: Norwegian municipality number, e.g. "4204".

        Returns:
            Configuration dict, or None if the municipality is not in the CMS.
        """
        return await self._client.get_municipality_config(municipality_id)
