# Third-party
from pydantic import BaseModel


class NaboResponse(BaseModel):
    """API response model for a neighboring property."""

    address: str | None = None
    owner_name: str | None = None
    phone: str | None = None
    email: str | None = None
    distance: float | None = None
    lat: float | None = None
    lon: float | None = None
