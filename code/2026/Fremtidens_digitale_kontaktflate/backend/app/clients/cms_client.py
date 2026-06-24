"""HTTP client for the cms-service microservice.

This module replaces the old adapter pattern (backend/app/cms/) with a single
async HTTP client that talks to cms-service. The backend no longer knows about
Wagtail — all CMS data flows through cms-service as an intermediary.

Architecture:
    Frontend  ->  Backend (FastAPI)  ->  cms-service  ->  Wagtail CMS
                  ^^^^^^^^^^^^^^^^
                  CmsClient lives here

Environment variables:
    CMS_SERVICE_URL: Base URL of the cms-service container.
                     Defaults to http://cms-service:8003 (Docker network).
"""

import logging
import os

import httpx

logger = logging.getLogger(__name__)

CMS_SERVICE_URL = os.getenv("CMS_SERVICE_URL", "http://cms-service:8003")


class CmsClient:
    """Async HTTP client for cms-service.

    Mirrors MatrikkelClient — wraps all cms-service endpoints.
    Instantiated once during app lifespan and shared via app.state.cms_client.

    All methods return parsed JSON (dict) or None/empty dict for 404 responses.
    Non-404 HTTP errors are raised as httpx.HTTPStatusError.
    """

    def __init__(self, client: httpx.AsyncClient):
        """Initialize with a shared httpx.AsyncClient from app lifespan.

        Args:
            client: The shared async HTTP client (also used by MatrikkelClient).
        """
        self._client = client
        self._base = CMS_SERVICE_URL

    async def get_municipality_config(self, municipality_id: str) -> dict | None:
        """Fetch municipality configuration (colors, logos, contact info, etc.).

        Args:
            municipality_id: Norwegian municipality number, e.g. "4204" for Kristiansand.

        Returns:
            Configuration dict if found, None if the municipality doesn't exist in CMS.

        Raises:
            httpx.HTTPStatusError: On non-404 HTTP errors (5xx, etc.).
        """
        logger.info("\U0001f7e6 BACKEND   \u2192 cms-service: GET /municipality-config/%s", municipality_id)
        r = await self._client.get(f"{self._base}/municipality-config/{municipality_id}")
        if r.status_code == 404:
            return None
        r.raise_for_status()
        logger.info("\U0001f7e6 BACKEND   \u2713 cms-service: kommune-config hentet (farger, logo, kontakt)")
        return r.json()

    async def get_tooltips(self, municipality_id: str) -> dict:
        """Fetch tooltip texts for info buttons in the frontend.

        Args:
            municipality_id: Norwegian municipality number, e.g. "4204".

        Returns:
            Dict of tooltip key-value pairs. Empty dict if municipality not found.

        Raises:
            httpx.HTTPStatusError: On non-404 HTTP errors.
        """
        logger.info("\U0001f7e6 BACKEND   \u2192 cms-service: GET /tooltips/%s", municipality_id)
        r = await self._client.get(f"{self._base}/tooltips/{municipality_id}")
        if r.status_code == 404:
            return {}
        r.raise_for_status()
        data = r.json()
        logger.info("\U0001f7e6 BACKEND   \u2713 cms-service svarte: %d tooltips", len(data))
        return data

    async def get_page_content(self, slug: str) -> dict | None:
        """Fetch CMS page content by slug.

        Args:
            slug: URL slug of the page, e.g. "about" or "privacy-policy".

        Returns:
            Page content dict if found, None if no page exists with that slug.

        Raises:
            httpx.HTTPStatusError: On non-404 HTTP errors.
        """
        r = await self._client.get(f"{self._base}/page-content/{slug}")
        if r.status_code == 404:
            return None
        r.raise_for_status()
        return r.json()

    async def get_media(self, path: str) -> httpx.Response:
        """Proxy a media file (images, documents) from cms-service.

        Unlike other methods, this returns the raw httpx.Response so the caller
        can stream the binary content back to the frontend.

        Args:
            path: Media path relative to cms-service, e.g. "images/logo.png".

        Returns:
            The raw httpx.Response for streaming.

        Raises:
            httpx.HTTPStatusError: On any HTTP error (including 404).
        """
        r = await self._client.get(f"{self._base}/media/{path}")
        r.raise_for_status()
        return r
