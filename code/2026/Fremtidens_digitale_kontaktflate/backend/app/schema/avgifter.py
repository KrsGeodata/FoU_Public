# Third-party
from pydantic import BaseModel


class AvgiftResponse(BaseModel):
    """API response model for a single municipal fee line."""

    gebyr: str | None = None
    grunnlag: str | None = None
    enhetspris: str | None = None
    andel: str | None = None
    korr: str | None = None
    fra_dato: str | None = None
    til_dato: str | None = None
    beløp: str | None = None
    årsbeløp: str | None = None
    type: str | None = None
