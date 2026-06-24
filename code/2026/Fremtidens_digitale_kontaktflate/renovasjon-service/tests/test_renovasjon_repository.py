from unittest.mock import AsyncMock, patch

import pytest

from app.repositories.renovasjon import RenovasjonRepository
from app.schema.renovasjon import HentedagerResponse, RenovasjonErrorResponse


@pytest.fixture
def repo():
    return RenovasjonRepository()


@pytest.mark.asyncio
async def test_address_not_found(repo):
    """Return error response when Kartverket cannot resolve the address."""
    with patch("app.repositories.renovasjon.lookup_adresse", new_callable=AsyncMock) as mock:
        mock.side_effect = ValueError("Fant ingen adresse")
        result = await repo.get_hentedager("Nonexistent street 99")

    assert isinstance(result, RenovasjonErrorResponse)
    assert result.error == "address_not_found"
    assert "Nonexistent street 99" == result.adresse


@pytest.mark.asyncio
async def test_unsupported_municipality(repo):
    """Return error response for a municipality with no configured provider."""
    geo = {"kommunenummer": "9999", "kommunenavn": "Ukjent"}
    with patch("app.repositories.renovasjon.lookup_adresse", new_callable=AsyncMock, return_value=geo):
        with patch("app.repositories.renovasjon.get_provider_for_kommune", return_value=None):
            result = await repo.get_hentedager("Adresse i ukjent kommune")

    assert isinstance(result, RenovasjonErrorResponse)
    assert result.error == "unsupported_municipality"
    assert result.kommunenummer == "9999"


@pytest.mark.asyncio
async def test_provider_error_response(repo):
    """Forward provider-level errors as RenovasjonErrorResponse."""
    geo = {"kommunenummer": "4204", "kommunenavn": "Kristiansand"}
    provider_error = {"error": "provider_timeout", "adresse": "Testveien 1", "provider": "norkart"}

    with patch("app.repositories.renovasjon.lookup_adresse", new_callable=AsyncMock, return_value=geo):
        with patch("app.repositories.renovasjon.get_provider_for_kommune", return_value="norkart"):
            repo._providers["norkart"].get_hentedager = AsyncMock(return_value=provider_error)
            result = await repo.get_hentedager("Testveien 1")

    assert isinstance(result, RenovasjonErrorResponse)
    assert result.error == "provider_timeout"


@pytest.mark.asyncio
async def test_successful_hentedager(repo):
    """Return HentedagerResponse on successful provider lookup."""
    geo = {"kommunenummer": "4204", "kommunenavn": "Kristiansand"}
    provider_result = {
        "adresse": "Søm terrasse 3",
        "kommune": "Kristiansand",
        "kommunenummer": "4204",
        "provider": "norkart",
        "hentedager": [
            {"fraksjon": "Restavfall", "neste_henting": "2026-04-10", "kommende_datoer": []},
        ],
    }

    with patch("app.repositories.renovasjon.lookup_adresse", new_callable=AsyncMock, return_value=geo):
        with patch("app.repositories.renovasjon.get_provider_for_kommune", return_value="norkart"):
            repo._providers["norkart"].get_hentedager = AsyncMock(return_value=provider_result)
            result = await repo.get_hentedager("Søm terrasse 3")

    assert isinstance(result, HentedagerResponse)
    assert result.adresse == "Søm terrasse 3"
    assert len(result.hentedager) == 1
    assert result.hentedager[0].fraksjon == "Restavfall"
