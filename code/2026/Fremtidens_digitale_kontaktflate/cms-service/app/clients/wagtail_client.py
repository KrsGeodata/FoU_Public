import os
import httpx

WAGTAIL_CMS_URL = os.getenv("WAGTAIL_CMS_URL", "http://wagtail-cms:8002")


class WagtailClient:
    """HTTP client that wraps all Wagtail API calls.

    This is the ONLY class in cms-service that knows about Wagtail URLs
    and response format. Routes use this client, never httpx directly.
    """

    def __init__(self, client: httpx.AsyncClient):
        self._client = client
        self._base = WAGTAIL_CMS_URL

    async def get_municipality_config(self, municipality_id: str) -> dict:
        """Fetch raw municipality config from Wagtail.

        Args:
            municipality_id: Municipality number (e.g. "4204")

        Returns:
            Raw dict from Wagtail JSON response.

        Raises:
            httpx.HTTPStatusError: On 404 or other HTTP errors.
        """
        r = await self._client.get(
            f"{self._base}/api/v2/municipality-config/{municipality_id}/"
        )
        r.raise_for_status()
        return r.json()

    async def get_media(self, path: str) -> httpx.Response:
        """Fetch a media file from Wagtail.

        Args:
            path: Media path relative to /media/ (e.g. "images/logo.png")

        Returns:
            Full httpx.Response so the caller can stream bytes and read content-type.

        Raises:
            httpx.HTTPStatusError: If the file doesn't exist.
        """
        r = await self._client.get(f"{self._base}/media/{path}")
        r.raise_for_status()
        return r
