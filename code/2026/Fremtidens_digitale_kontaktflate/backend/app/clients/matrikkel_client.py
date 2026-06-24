# Standard library
import os
from typing import Any

# Third-party
import httpx

_FALLBACK_MATRIKKEL_URL = "http://matrikkel-service:8001"


class MatrikkelClient:
    """
    Async HTTP client for the matrikkel-service.

    Wraps all matrikkel-service endpoints. The base URL is configured via
    the MATRIKKEL_SERVICE_URL environment variable, making it easy to swap
    in Kartverket's real Matrikkel API in the future.
    """

    def __init__(self, client: httpx.AsyncClient, base_url: str | None = None):
        self._client = client
        self._base = base_url or os.getenv("MATRIKKEL_SERVICE_URL", _FALLBACK_MATRIKKEL_URL)

    async def list_eiendommer(self) -> list[dict[str, Any]]:
        """Fetch all properties from the matrikkel."""
        r = await self._client.get(f"{self._base}/eiendommer")
        if r.status_code == 404:
            return []
        r.raise_for_status()
        return r.json()

    async def get_eiendom(
        self, gnr: int, bnr: int, fnr: int, snr: int, kommunenr: str | None = None,
    ) -> dict[str, Any] | None:
        """Fetch basic property information by cadastral key.

        Args:
            gnr: Gardsnummer.
            bnr: Bruksnummer.
            fnr: Festenummer.
            snr: Seksjonsnummer.
            kommunenr: Kommunenummer (optional, narrows to a single municipality).

        Returns:
            Property data dict, or None if not found.
        """
        params: dict[str, Any] = {"gnr": gnr, "bnr": bnr, "fnr": fnr, "snr": snr}
        if kommunenr:
            params["kommunenr"] = kommunenr
        r = await self._client.get(
            f"{self._base}/eiendom",
            params=params,
        )
        if r.status_code == 404:
            return None
        r.raise_for_status()
        return r.json()

    async def get_eiere(self, gnr: int, bnr: int, fnr: int, snr: int) -> list[dict[str, Any]]:
        """Fetch ownership information for a property."""
        r = await self._client.get(f"{self._base}/eiendom/{gnr}/{bnr}/{fnr}/{snr}/eiere")
        if r.status_code == 404:
            return []
        r.raise_for_status()
        return r.json()

    async def get_bygg(self, gnr: int, bnr: int, fnr: int, snr: int) -> list[dict[str, Any]]:
        """Fetch buildings, floors and units for a property."""
        r = await self._client.get(f"{self._base}/eiendom/{gnr}/{bnr}/{fnr}/{snr}/bygg")
        if r.status_code == 404:
            return []
        r.raise_for_status()
        return r.json()

    async def get_avgifter(self, gnr: int, bnr: int, fnr: int, snr: int) -> list[dict[str, Any]]:
        """Fetch municipal fees for a property."""
        r = await self._client.get(f"{self._base}/eiendom/{gnr}/{bnr}/{fnr}/{snr}/avgifter")
        if r.status_code == 404:
            return []
        r.raise_for_status()
        return r.json()

    async def get_naboer(self, gnr: int, bnr: int, fnr: int, snr: int, radius: float = 25) -> list[dict[str, Any]]:
        """Fetch neighboring properties within a given radius."""
        r = await self._client.get(
            f"{self._base}/eiendom/{gnr}/{bnr}/{fnr}/{snr}/naboer",
            params={"radius": radius},
        )
        if r.status_code == 404:
            return []
        r.raise_for_status()
        return r.json()
