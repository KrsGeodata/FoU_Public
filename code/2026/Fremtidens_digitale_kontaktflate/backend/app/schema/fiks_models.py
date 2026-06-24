# Third-party
from pydantic import BaseModel


class MatrikkelnummerRequest(BaseModel):
    """Matrikkelnummer used in FIKS-style POST requests."""
    kommunenummer: str
    gardsnummer: int
    bruksnummer: int
    festenummer: int = 0
    seksjonsnummer: int = 0


class ByggesakSokRequest(BaseModel):
    """Request body for searching byggesaker by matrikkelnummer."""
    matrikkelnummer: MatrikkelnummerRequest
