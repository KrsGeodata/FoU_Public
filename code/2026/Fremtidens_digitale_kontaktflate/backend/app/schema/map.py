# Third-party
from pydantic import BaseModel


class MapCoordinatesResponse(BaseModel):
    """
    API response model for map coordinates only.
    """
    lat: float | None = None
    lon: float | None = None
