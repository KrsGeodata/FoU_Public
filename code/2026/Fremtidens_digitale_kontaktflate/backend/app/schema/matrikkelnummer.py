# Third-party
from pydantic import BaseModel


class Matrikkelnummer(BaseModel):
    """Cadastral property identifier used throughout the API."""
    kommunenr: str
    gnr: int
    bnr: int
    fnr: int = 0
    snr: int = 0
