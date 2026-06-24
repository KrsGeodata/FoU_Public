from abc import ABC, abstractmethod


class Provider(ABC):
    @abstractmethod
    async def get_hentedager(self, adresse: str, kommunenummer: str) -> dict:
        """
        Returns normalized hentedager dict:
        {
          "adresse": str,
          "kommune": str,
          "kommunenummer": str,
          "provider": str,
          "hentedager": [{"fraksjon": str, "neste_henting": str, "kommende_datoer": list[str]}]
        }
        On unsupported municipality, returns error dict instead of raising.
        """
