from datetime import date
from typing import Literal

from pydantic import BaseModel, Field

from schemas.plan import FieldOut, HensynssoneOption


class BestemmelseTitle(BaseModel):
    id: int
    label: str


class BestemmelseCategory(BaseModel):
    id: int
    name: str
    titles: list[BestemmelseTitle]


class BuildingTypeOption(BaseModel):
    code: str
    name: str


class BestemmelseScopeItem(BaseModel):
    fieldId: int
    fieldName: str | None = None
    plotId: int | None = None
    plotName: str | None = None


class GalleriItemRef(BaseModel):
    """Reference to a gallery item in a bestemmelse"""
    id: int  # bestemmelse_galleri.id (junction table ID)
    tema_tittel_galleri_id: int
    forklaring: str | None = None
    overskrift: str
    bildefilnavn: str | None = None
    forklaringstekst: str | None = None
    sortering: int = 0


class BestemmelseItem(BaseModel):
    id: int
    titleId: int | None = None
    titleLabel: str | None = None
    hensynssoneKode: int | None = None
    hensynssoneNavn: str | None = None
    content: str
    sortering: int
    scope: list[BestemmelseScopeItem]
    buildingTypeCodes: list[str]
    galleriItems: list[GalleriItemRef] = Field(default_factory=list)  # Multiple gallery items


class BestemmelseUpsertRequest(BaseModel):
    titleId: int | None = None
    hensynssoneKode: int | None = None
    content: str = Field(min_length=1)
    sortering: int = 0
    scope: list[dict[str, int | None]] = Field(default_factory=list)
    buildingTypeCodes: list[str] = Field(default_factory=list)
    galleriItemIds: list[int] = Field(default_factory=list)  # IDs from tema_tittel_galeri


class PlanDetail(BaseModel):
    id: int
    planId: str
    name: str
    adoptedDate: date | None = None
    mapUrl: str | None = None
    regulationsUrl: str | None = None
    descriptionUrl: str | None = None
    fields: list[FieldOut]
    categories: list[BestemmelseCategory]
    buildingTypes: list[BuildingTypeOption]
    hensynssoner: list[HensynssoneOption]
    bestemmelser: list[BestemmelseItem]


class ScopeTypeRef(BaseModel):
    scope_type: Literal['plan', 'felt', 'tomt']
    scope_ref_id: int
