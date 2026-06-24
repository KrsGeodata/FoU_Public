from datetime import date, datetime

from pydantic import BaseModel, Field


class PlanListItem(BaseModel):
    id: int
    plan_id: str
    name: str
    adopted_date: date | None = None
    field_count: int
    plot_count: int
    updated_at: datetime


class PlanregisterSuggestion(BaseModel):
    id: int
    plan_id: str
    name: str
    adopted_date: date | None = None


class HensynssoneOption(BaseModel):
    kode: int
    navn: str


class PlotInput(BaseModel):
    name: str = Field(min_length=1, max_length=120)


class FieldInput(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    formal_1: str | None = None
    formal_2: str | None = None
    plots: list[PlotInput] = Field(default_factory=list)


class PlanUpsertRequest(BaseModel):
    plan_id: str = Field(min_length=1, max_length=120)
    map_url: str | None = None
    regulations_url: str | None = None
    description_url: str | None = None
    fields: list[FieldInput] = Field(default_factory=list)


class PlotOut(BaseModel):
    id: int
    plotName: str


class FieldOut(BaseModel):
    id: int
    fieldName: str
    formal_1: str | None = None
    formal_2: str | None = None
    plots: list[PlotOut]


class FormalCodeOption(BaseModel):
    formal_1: str
    formal_2: str


class FormalCodeGroup(BaseModel):
    formal_1: str
    formal_2_options: list[str]
