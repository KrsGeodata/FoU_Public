# Third-party
from pydantic import BaseModel


class RepresentantInfo(BaseModel):
    """
    API response model for an organisation representative.
    """
    personnr: str | None = None
    navn: str | None = None


class OwnerInfo(BaseModel):
    """
    API response model for property owner details.
    """
    type: str | None = None
    personnr: str | None = None
    name: str | None = None
    eierbrok: str | None = None
    orgnr: str | None = None
    representanter: list[RepresentantInfo] = []
    
class PropertyInfoResponse(BaseModel):
    """
    API response model for property details shown in the info card.
    """
    address: str | None = None
    owners: list[OwnerInfo] = []
    propertyArea: float | None = None
    gnr: str | None = None
    bnr: str | None = None
    fnr: str | None = None
    snr: str | None = None
    municipality_id: str | None = None
