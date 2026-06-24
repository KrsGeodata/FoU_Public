# Third-party
from sqlalchemy.orm import Session

# Local
from app.models import Eiendom
from app.schema.bygg import ByggResponse, EtasjeResponse, BruksenhetResponse, VedtakResponse


class ByggRepository:
    """Repository for querying building records from the matrikkel_eiendommer table."""

    def __init__(self, db: Session):
        """Initialize the repository with a database session.

        Args:
            db (Session): SQLAlchemy database session.
        """
        self._db = db

    def get_bygg(self, gnr: int, bnr: int, fnr: int, snr: int) -> list[ByggResponse] | None:
        """Retrieve buildings, floors and units for a property.

        Args:
            gnr (int): Gardsnummer.
            bnr (int): Bruksnummer.
            fnr (int): Festenummer.
            snr (int): Seksjonsnummer.

        Returns:
            list[ByggResponse] | None: List of buildings with nested floors and units,
                or None if the property is not found.
        """
        row = self._db.query(Eiendom).filter_by(gnr=gnr, bnr=bnr, fnr=fnr, snr=snr).first()
        if not row:
            return None
        bygg_liste = (row.data or {}).get("bygg", [])
        return [
            ByggResponse(
                type=b.get("TYPE"),
                bygningsnr=b.get("BYGGNINGSNR"),
                status=b.get("STATUS"),
                vannforsyning=b.get("VANNFORSYNING"),
                avlop=b.get("AVLØP"),
                bra_bolig=b.get("BRA.BOLIG"),
                bra_annet=b.get("BRA.ANNET"),
                etasjer=[
                    EtasjeResponse(
                        etasje=e.get("ETASJE"),
                        ant_boenh=e.get("ANT.BOENH"),
                        bra_bolig=e.get("BRA.BOLIG"),
                        bra_annet=e.get("BRA.ANNET"),
                        bra_totalt=e.get("BRA.TOTALT"),
                        alt_areal=e.get("ALT.AREAL"),
                        alt_areal2=e.get("ALT.AREAL2"),
                        bta_bolig=e.get("BTA.BOLIG"),
                        bta_annet=e.get("BTA.ANNET"),
                        bta_totalt=e.get("BTA.TOTALT"),
                    )
                    for e in b.get("etasjer", [])
                ],
                bruksenheter=[
                    BruksenhetResponse(
                        adresse=u.get("ADRESSE"),
                        bolig=u.get("BOLIG"),
                        bra=u.get("BRA"),
                        bad=u.get("BAD"),
                        wc=u.get("WC"),
                        rom=u.get("ROM"),
                        type=u.get("TYPE"),
                        kjokken=u.get("KJØKKEN"),
                        eiendom=u.get("EIENDOM"),
                        sist_endret=u.get("SIST.ENDRET"),
                    )
                    for u in b.get("bruksenheter", [])
                ],
                vedtak=[
                    VedtakResponse(
                        status=v.get("STATUS"),
                        dato=v.get("DATO"),
                        arsak=v.get("ÅRSAK"),
                        referanse=v.get("REFERANSE"),
                        reg_dato=v.get("REG.DATO"),
                        slettet_dato=v.get("SLETTET.DATO"),
                    )
                    for v in b.get("vedtak", [])
                ],
            )
            for b in bygg_liste
        ]
