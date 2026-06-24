# Third-party
from pydantic import BaseModel


class RepresentantResponse(BaseModel):
    """API response model for an organisation representative."""

    personnr: str | None = None
    navn: str | None = None


class EierResponse(BaseModel):
    """API response model for a single property owner."""

    type: str | None = None
    personnr: str | None = None
    navn: str | None = None
    adresse: str | None = None
    poststed: str | None = None
    andel: str | None = None
    rolle: str | None = None
    ervervet: str | None = None
    orgnr: str | None = None
    representanter: list[RepresentantResponse] = []
