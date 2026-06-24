from .base import Provider


class BirProvider(Provider):
    async def get_hentedager(self, adresse: str, kommunenummer: str) -> dict:
        return {
            "adresse": adresse,
            "kommune": "Bergen",
            "kommunenummer": kommunenummer,
            "provider": None,
            "error": "unsupported_municipality",
            "message": "BIR (Bergen) is not yet supported. Supported providers: norkart, stavanger, avfallsor",
        }
