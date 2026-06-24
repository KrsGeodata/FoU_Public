# Standard library
import logging
import os
from typing import Any

# Third-party
import httpx

logger = logging.getLogger(__name__)

_FALLBACK_FIKS_INNSYN_URL = "http://arkiv-service:8005"


class FiksInnsynClient:
    """
    Async HTTP client for the FIKS Innsyn API (arkiv-service mock).

    In production, swap FIKS_INNSYN_URL to the real FIKS endpoint
    and add Maskinporten JWT authentication headers.
    """

    def __init__(self, client: httpx.AsyncClient, base_url: str | None = None):
        self._client = client
        self._base = base_url or os.getenv("FIKS_INNSYN_URL", _FALLBACK_FIKS_INNSYN_URL)

    async def sok_byggesaker(self, matrikkelnummer: dict[str, Any]) -> dict[str, Any]:
        """Search building cases by matrikkelnummer via FIKS Innsyn."""
        logger.info(
            "\U0001f7e6 BACKEND   \u2192 arkiv-service: POST /innsyn-sok/api/v1/eiendom/sok (mnr=%s/%s/%s)",
            matrikkelnummer.get("kommunenummer"),
            matrikkelnummer.get("gardsnummer"),
            matrikkelnummer.get("bruksnummer"),
        )
        payload = {
            "matrikkelnummer": matrikkelnummer,
            "akseptertMeldingVersjon": ["fakturaV1", "mappeV1", "forsendelseV1"],
        }
        r = await self._client.post(
            f"{self._base}/innsyn-sok/api/v1/eiendom/sok",
            json=payload,
            timeout=10.0,
        )
        if r.status_code == 404:
            return {"antallTreff": 0, "treff": []}
        r.raise_for_status()
        data = r.json()
        logger.info("\U0001f7e6 BACKEND   \u2713 arkiv-service svarte: %d byggesaker", data.get("antallTreff", 0))
        return data

    async def get_dokumenter(self, sak_id: str) -> list[dict[str, Any]]:
        """Get document metadata for a building case."""
        r = await self._client.get(
            f"{self._base}/innsyn-sok/api/v1/dokument/{sak_id}",
            timeout=10.0,
        )
        if r.status_code == 404:
            return []
        r.raise_for_status()
        return r.json()
