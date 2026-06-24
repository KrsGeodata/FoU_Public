# Standard library
from typing import Any

# Third-party
from sqlalchemy import Integer
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

# Local
from app.database import Base


class Eiendom(Base):
    """
    SQLAlchemy model for the matrikkel_eiendommer table.

    Stores one cadastral property per row. All property data is held
    in the JSONB `data` column, matching the Matrikkel export format.
    """

    __tablename__ = "matrikkel_eiendommer"

    id:  Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    gnr: Mapped[int] = mapped_column(Integer, nullable=False)
    bnr: Mapped[int] = mapped_column(Integer, nullable=False)
    fnr: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    snr: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    data: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
