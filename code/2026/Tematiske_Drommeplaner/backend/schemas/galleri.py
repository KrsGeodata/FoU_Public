from pydantic import BaseModel, Field
from datetime import datetime


class DatafeltTypeOption(BaseModel):
    id: int
    navn: str  # m, m2, %, °


class GalleriItem(BaseModel):
    """Single gallery item linked to a tema_tittel"""
    id: int
    tema_tittel_id: int
    forklaring: str  # Short explanation for dropdown
    overskrift: str  # Public title shown to users
    bildefilnavn: str | None = None  # Image filename
    forklaringstekst: str | None = None  # Image description
    datafelt_type_id: int | None = None  # Foreign key to datafelt_type (unit: m, m2, %, °)
    datafelt_type_navn: str | None = None  # The unit name (for convenience)
    sortering: int = 0
    created_at: datetime | None = None
    updated_at: datetime | None = None


class GalleriItemCreate(BaseModel):
    """Input model for creating a new gallery item"""
    tema_tittel_id: int
    forklaring: str = Field(min_length=1, max_length=500)
    overskrift: str = Field(min_length=1, max_length=255)
    bildefilnavn: str | None = Field(None, max_length=255)
    forklaringstekst: str | None = None
    datafelt_type_id: int | None = None  # Reference to datafelt_type.id
    sortering: int = 0


class GalleriItemUpdate(BaseModel):
    """Input model for updating a gallery item"""
    forklaring: str | None = None
    overskrift: str | None = None
    bildefilnavn: str | None = None
    forklaringstekst: str | None = None
    datafelt_type_id: int | None = None
    sortering: int | None = None


class GalleriItemList(BaseModel):
    """Response model for listing gallery items for a tema_tittel"""
    items: list[GalleriItem]
    total: int
