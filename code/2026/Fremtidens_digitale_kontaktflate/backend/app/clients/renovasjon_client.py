import logging
import os

import httpx

RENOVASJON_SERVICE_URL = os.getenv("RENOVASJON_SERVICE_URL", "http://renovasjon-service:8004")

logger = logging.getLogger(__name__)


class RenovasjonClient:
    """Async HTTP client for the renovasjon-service.

    Wraps the RenovasjonAPI endpoint. The base URL is configured via
    the RENOVASJON_SERVICE_URL environment variable.
    """

    def __init__(self, client: httpx.AsyncClient):
        self._client = client
        self._base = RENOVASJON_SERVICE_URL

    async def get_hentedager(self, adresse: str) -> dict | None:
        """Fetch waste collection data for an address.

        Args:
            adresse: Full Norwegian address, e.g. "Dronningens gate 2, 4610 Kristiansand".

        Returns:
            dict with waste collection data, or None if address not found or service unavailable.
            For known errors (unsupported municipality, bad request), the error
            body from renovasjon-service is returned as-is so callers can inspect it.
        """
        logger.info("\U0001f7e6 BACKEND   \u2192 renovasjon-service: GET /hentedager (adr=***)")
        try:
            r = await self._client.get(
                f"{self._base}/hentedager",
                params={"adresse": adresse},
                timeout=15.0,
            )
            if r.status_code == 404:
                return None
            if r.status_code in (400, 422):
                return r.json()
            r.raise_for_status()
            return r.json()
        except httpx.HTTPError:
            logger.exception("Failed to reach renovasjon-service (adr=***)")
            return None
