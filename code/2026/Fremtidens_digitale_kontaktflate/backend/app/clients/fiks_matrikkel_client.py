# Standard library
import logging
import os
from typing import Any

# Third-party
import httpx

logger = logging.getLogger(__name__)

_FALLBACK_FIKS_MATRIKKEL_URL = "http://matrikkel-service:8001"
_FALLBACK_FIKS_ORG_ID = "mock"


class FiksMatrikkelClient:
    """
    Async HTTP client for the FIKS Matrikkel Eier API.

    In production, swap FIKS_MATRIKKEL_URL to the real FIKS endpoint,
    set FIKS_ORG_ID to the municipality's organisation ID,
    and add Maskinporten JWT authentication headers.
    """

    def __init__(
        self,
        client: httpx.AsyncClient,
        base_url: str | None = None,
        fiks_org_id: str | None = None,
    ):
        self._client = client
        self._base = base_url or os.getenv("FIKS_MATRIKKEL_URL", _FALLBACK_FIKS_MATRIKKEL_URL)
        self._org_id = fiks_org_id or os.getenv("FIKS_ORG_ID", _FALLBACK_FIKS_ORG_ID)

    async def finn_eiendommer(self, fodselsnummer: str) -> list[dict[str, Any]]:
        """Find properties owned by a person (fodselsnummer)."""
        logger.info("\U0001f7e6 BACKEND   \u2192 matrikkel-service: POST /finn-eiendommer (personnr: ***%s)", fodselsnummer[-4:])
        payload = {"type": "FYSISK_PERSON", "verdi": fodselsnummer}
        r = await self._client.post(
            f"{self._base}/matrikkel-eier/api/v1/{self._org_id}/finn-eiendommer",
            json=payload,
            timeout=10.0,
        )
        r.raise_for_status()
        eiendommer = r.json().get("eiendommer", [])
        logger.info("\U0001f7e6 BACKEND   \u2713 matrikkel-service svarte: %d eiendommer funnet", len(eiendommer))
        return eiendommer

    async def finn_eiendommer_by_orgnr(self, orgnr: str) -> list[dict[str, Any]]:
        """Find properties owned by an organisation (orgnr)."""
        payload = {"type": "JURIDISK_PERSON", "verdi": orgnr}
        r = await self._client.post(
            f"{self._base}/matrikkel-eier/api/v1/{self._org_id}/finn-eiendommer",
            json=payload,
            timeout=10.0,
        )
        r.raise_for_status()
        return r.json().get("eiendommer", [])

    async def finn_eiere(self, matrikkelnummer: dict[str, Any]) -> list[dict[str, Any]]:
        """Find owners of a property by matrikkelnummer."""
        r = await self._client.post(
            f"{self._base}/matrikkel-eier/api/v1/{self._org_id}/finn-eiere",
            json=[matrikkelnummer],
            timeout=10.0,
        )
        r.raise_for_status()
        resultater = r.json().get("resultater", [])
        if resultater:
            return resultater[0].get("eiere", [])
        return []
