from pydantic import BaseModel


class FloorResponse(BaseModel):
    """API response model for building floor information."""

    floor: str | None = None
    dwelling_units: str | None = None
    residential_area: str | None = None
    other_area: str | None = None
    total_area: str | None = None
    alt_area: str | None = None
    alt_area2: str | None = None
    gross_area_residential: str | None = None
    gross_area_other: str | None = None
    gross_area_total: str | None = None


class UnitResponse(BaseModel):
    """API response model for a residential unit within a building."""

    address: str | None = None
    unit_number: str | None = None
    area: str | None = None
    bathroom: str | None = None
    toilet: str | None = None
    rooms: str | None = None
    unit_type: str | None = None
    kitchen: str | None = None
    property_id: str | None = None
    last_changed: str | None = None


class VedtakResponse(BaseModel):
    """API response model for a building status record."""

    status: str | None = None
    date: str | None = None
    reason: str | None = None
    reference: str | None = None
    registration_date: str | None = None
    deleted_date: str | None = None


class BuildingResponse(BaseModel):
    """API response model for building information."""

    building_type: str | None = None
    building_number: str | None = None
    status: str | None = None
    water_supply: str | None = None
    sewage: str | None = None
    residential_area: str | None = None
    other_area: str | None = None
    floors: list[FloorResponse] = []
    units: list[UnitResponse] = []
    vedtak: list[VedtakResponse] = []
