# Third-party
from pydantic import BaseModel


class KoordinaterResponse(BaseModel):
    """API response model for property coordinates."""

    nord: str | None = None
    ost: str | None = None


class EiendomResponse(BaseModel):
    """API response model for basic property information and coordinates."""

    id: int
    gnr: int
    bnr: int
    fnr: int
    snr: int
    avfallsor_id: str | None = None
    eiendomstype: str | None = None
    vegadresse: str | None = None
    postnummerområde: str | None = None
    kommunenr: str | None = None
    areal: str | None = None
    koordinater: KoordinaterResponse | None = None
