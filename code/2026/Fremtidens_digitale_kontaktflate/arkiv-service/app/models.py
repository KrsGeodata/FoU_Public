# Standard library
import uuid

# Third-party
from sqlalchemy import Integer, String, Date, ForeignKey, Index, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

# Local
from app.database import Base


class ArkivSak(Base):
    """
    A building case (byggesak) from the municipal archive.

    In production this data comes from FIKS Innsyn (sourced from
    the municipality's archive system, e.g. Public 360 or ePhorte).
    """

    __tablename__ = "arkiv_saker"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    kommunenummer: Mapped[str] = mapped_column(String(4), nullable=False)
    gardsnummer: Mapped[int] = mapped_column(Integer, nullable=False)
    bruksnummer: Mapped[int] = mapped_column(Integer, nullable=False)
    festenummer: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    seksjonsnummer: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    saksaar: Mapped[int] = mapped_column(Integer, nullable=False)
    sakssekvensnummer: Mapped[int] = mapped_column(Integer, nullable=False)
    tittel: Mapped[str] = mapped_column(String(500), nullable=False)
    saksstatus: Mapped[str] = mapped_column(String(100), nullable=False)
    saksdato: Mapped[str] = mapped_column(String(10), nullable=False)
    avsluttet_dato: Mapped[str | None] = mapped_column(String(10), nullable=True)
    beskrivelse: Mapped[str | None] = mapped_column(Text, nullable=True)

    dokumenter: Mapped[list["ArkivDokument"]] = relationship(
        back_populates="sak", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index(
            "ix_arkiv_saker_matrikkelnr",
            "kommunenummer", "gardsnummer", "bruksnummer",
            "festenummer", "seksjonsnummer",
        ),
    )


class ArkivDokument(Base):
    """
    A document belonging to a building case.

    Stores metadata and a mock file reference (no actual file storage).
    """

    __tablename__ = "arkiv_dokumenter"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    sak_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("arkiv_saker.id"), nullable=False
    )
    tittel: Mapped[str] = mapped_column(String(500), nullable=False)
    dokumenttype: Mapped[str] = mapped_column(String(100), nullable=False)
    filnavn: Mapped[str] = mapped_column(String(255), nullable=False)
    mimetype: Mapped[str] = mapped_column(String(100), nullable=False, default="application/pdf")
    opprettet_dato: Mapped[str] = mapped_column(String(10), nullable=False)

    sak: Mapped["ArkivSak"] = relationship(back_populates="dokumenter")

    __table_args__ = (
        Index("ix_arkiv_dokumenter_sak_id", "sak_id"),
    )
