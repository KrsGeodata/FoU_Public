# Standard library
import logging

# Third-party
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import httpx

# Local
from app.clients.fiks_matrikkel_client import FiksMatrikkelClient
from app.dependencies import get_fiks_matrikkel_client

logger = logging.getLogger(__name__)

router = APIRouter()


class FinnEiendommerRequest(BaseModel):
    fodselsnummer: str


class MatrikkelnummerResponse(BaseModel):
    kommunenummer: str
    gardsnummer: int
    bruksnummer: int
    festenummer: int
    seksjonsnummer: int


class EiendomMedAdresseResponse(BaseModel):
    matrikkelnummer: MatrikkelnummerResponse
    vegadresse: str | None = None
    postnummerområde: str | None = None


@router.post("/eiendommer/sok", response_model=list[EiendomMedAdresseResponse])
async def sok_eiendommer(
    request: FinnEiendommerRequest,
    client: FiksMatrikkelClient = Depends(get_fiks_matrikkel_client),
):
    """Find properties owned by a person via FIKS Matrikkel Eier."""
    try:
        return await client.finn_eiendommer(request.fodselsnummer)
    except httpx.HTTPStatusError as e:
        logger.error("FIKS Matrikkel eier lookup failed: %s", e)
        raise HTTPException(status_code=502, detail="Feil ved oppslag mot matrikkel-tjenesten")
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Matrikkel-tjenesten svarte ikke i tide")
