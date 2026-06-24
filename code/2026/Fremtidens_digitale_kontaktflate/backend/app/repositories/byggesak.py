# Local
from app.clients.fiks_innsyn_client import FiksInnsynClient
from app.schema.byggesak import BuildingCaseResponse, DocumentResponse


class FiksByggesakRepository:
    """Transforms FIKS Innsyn responses into internal BuildingCaseResponse models."""

    def __init__(self, client: FiksInnsynClient):
        self._client = client

    async def get_building_cases(
        self, kommunenummer: str, gnr: int, bnr: int, fnr: int, snr: int
    ) -> list[BuildingCaseResponse]:
        """Search building cases via FIKS Innsyn and map to internal schema."""
        matrikkelnummer = {
            "kommunenummer": kommunenummer,
            "gardsnummer": gnr,
            "bruksnummer": bnr,
            "festenummer": fnr,
            "seksjonsnummer": snr,
        }
        result = await self._client.sok_byggesaker(matrikkelnummer)

        cases = []
        for treff in result.get("treff", []):
            mappe = treff.get("mappe", {})
            saksnr = mappe.get("saksnummer") or {}
            saksaar = saksnr.get("saksaar")
            sakssekvensnummer = saksnr.get("sakssekvensnummer")
            case_number = (
                f"{saksaar}/{sakssekvensnummer}"
                if saksaar is not None and sakssekvensnummer is not None
                else None
            )
            cases.append(
                BuildingCaseResponse(
                    case_id=treff.get("meldingId", ""),
                    case_number=case_number,
                    title=mappe.get("tittel"),
                    status=mappe.get("saksstatus"),
                    created_date=mappe.get("saksdato"),
                    closed_date=mappe.get("avsluttetDato"),
                )
            )
        return cases

    async def get_case_documents(self, sak_id: str) -> list[DocumentResponse]:
        """Get documents for a building case via FIKS Innsyn."""
        docs = await self._client.get_dokumenter(sak_id)

        return [
            DocumentResponse(
                id=d.get("dokumentId", ""),
                title=d.get("tittel"),
                document_type=d.get("dokumenttype"),
                uploaded_at=d.get("opprettetDato"),
            )
            for d in docs
        ]
