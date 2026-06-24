from pydantic import BaseModel


class PageContentResponse(BaseModel):
    """Response for GET /page-content/{slug}.

    All fields except slug are optional.
    """

    # Primary page identifier used by the CMS.
    slug: str
    page_title: str | None = None
    intro_text: str | None = None
    info_section_body: str | None = None
