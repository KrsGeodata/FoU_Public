import logging

from app.clients.kartverket import lookup_adresse
from app.kommune_map import get_provider_for_kommune
from app.providers import (
    Provider,
    NorkartProvider,
    OsloProvider,
    StavangerProvider,
    AvfallSorProvider,
    BirProvider,
)
from app.schema.renovasjon import HentedagerResponse, Hentedag, RenovasjonErrorResponse

logger = logging.getLogger(__name__)


class RenovasjonRepository:
    """Resolves an address to a municipality and dispatches to the correct provider."""

    def __init__(self):
        self._providers: dict[str, Provider] = {
            "norkart": NorkartProvider(),
            "stavanger": StavangerProvider(),
            "avfallsor": AvfallSorProvider(),
            "oslo": OsloProvider(),
            "bir": BirProvider(),
        }
        self._supported_public = [name for name in self._providers if name != "bir"]

    async def get_hentedager(
        self, adresse: str
    ) -> HentedagerResponse | RenovasjonErrorResponse:
        try:
            geo = await lookup_adresse(adresse)
        except ValueError as e:
            return RenovasjonErrorResponse(
                adresse=adresse,
                error="address_not_found",
                message=str(e),
            )

        kommunenummer = geo["kommunenummer"]
        provider_name = get_provider_for_kommune(kommunenummer)

        if provider_name is None:
            return RenovasjonErrorResponse(
                adresse=adresse,
                kommune=geo["kommunenavn"],
                kommunenummer=kommunenummer,
                error="unsupported_municipality",
                message=(
                    f"Kommune {geo['kommunenavn']} ({kommunenummer}) is not yet "
                    f"supported. Supported providers: {', '.join(self._supported_public)}"
                ),
            )

        raw = await self._providers[provider_name].get_hentedager(adresse, kommunenummer)

        if "error" in raw:
            return RenovasjonErrorResponse(
                adresse=raw.get("adresse", adresse),
                kommune=raw.get("kommune"),
                kommunenummer=raw.get("kommunenummer", kommunenummer),
                provider=raw.get("provider"),
                error=raw["error"],
                message=raw.get("message"),
            )

        return HentedagerResponse(
            adresse=raw["adresse"],
            kommune=raw.get("kommune"),
            kommunenummer=raw.get("kommunenummer"),
            provider=raw.get("provider"),
            hentedager=[
                Hentedag(
                    fraksjon=h.get("fraksjon", ""),
                    neste_henting=h.get("neste_henting"),
                    kommende_datoer=h.get("kommende_datoer", []),
                )
                for h in raw.get("hentedager", [])
            ],
        )
