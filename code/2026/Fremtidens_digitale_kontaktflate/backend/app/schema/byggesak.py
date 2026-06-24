from pydantic import BaseModel


class BuildingCaseResponse(BaseModel):
    case_id: str
    case_number: str | None = None
    title: str | None = None
    status: str | None = None
    case_officer: str | None = None
    created_date: str | None = None
    closed_date: str | None = None


class DocumentResponse(BaseModel):
    id: str
    title: str | None = None
    document_type: str | None = None
    uploaded_at: str | None = None
