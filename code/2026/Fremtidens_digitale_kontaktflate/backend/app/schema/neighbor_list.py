from pydantic import BaseModel

class NeighborListResponse(BaseModel):
    address: str | None = None
    owner_name: str | None = None
    phone: str | None = None
    email: str | None = None
    distance: float | None = None
    lat: float | None = None
    lon: float | None = None