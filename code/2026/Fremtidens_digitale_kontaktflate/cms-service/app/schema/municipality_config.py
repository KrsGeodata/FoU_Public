from pydantic import BaseModel, Field


class CmsColors(BaseModel):
    """Color palette for a municipality."""

    # Frontend brand palette for the municipality.
    primary: str
    secondary: str


class CmsContact(BaseModel):
    """Contact information for a municipality."""

    email: str
    phone: str
    website: str
    # Optional visiting address lines; empty when not provided.
    visiting_address_line1: str = ""
    visiting_address_line2: str = ""
    opening_hours: list[str] = Field(default_factory=list)


class CmsLink(BaseModel):
    """A labeled hyperlink."""

    label: str
    url: str


class MunicipalityConfig(BaseModel):
    """Full configuration for a municipality, as served to the frontend."""

    municipality_id: str
    name: str
    # CMS asset URL; may be rewritten by cms-service before returning.
    logo_url: str
    colors: CmsColors
    contact: CmsContact
    org_number: str
    content_blocks: dict[str, str]
    links: list[CmsLink]
    # Generic dict so any tooltip key added in Wagtail passes through without schema changes.
    tooltips: dict[str, str] = Field(default_factory=dict)
