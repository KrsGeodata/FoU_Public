import httpx
from datetime import datetime, timedelta
from .base import Provider
from app.config import OSLO_URL, HTTP_TIMEOUT

_FREQUENCY_DAYS = {
    10000: 7,       # 1 gang pr. uke
    20000: 3,       # 2 ganger pr. uke (~3.5 days)
    30000: 2,       # 3 ganger pr. uke (~2.3 days)
    40000: 14,      # annenhver uke
    2500: 28,       # hver 4. uke
    50000: 30,      # 1 gang pr. måned
}


def _parse_date(date_str: str) -> str | None:
    """Parse Oslo date format 'dd.MM.yyyy' to ISO 8601."""
    try:
        return datetime.strptime(date_str.strip(), "%d.%m.%Y").strftime("%Y-%m-%d")
    except (ValueError, AttributeError):
        return None


def _project_dates(first_date: str, frequency_factor: int, count: int = 2) -> list[str]:
    """Project future collection dates from the first date and frequency."""
    interval = _FREQUENCY_DAYS.get(frequency_factor)
    if not interval or not first_date:
        return [first_date] if first_date else []

    base = datetime.strptime(first_date, "%Y-%m-%d")
    return [(base + timedelta(days=interval * i)).strftime("%Y-%m-%d") for i in range(count)]


class OsloProvider(Provider):
    async def get_hentedager(self, adresse: str, kommunenummer: str) -> dict:
        from app.clients.kartverket import lookup_adresse

        geo = await lookup_adresse(adresse)
        raw = geo.get("raw", {})

        street_id = raw.get("adressekode")
        street_name = geo.get("adressenavn", "")
        house_number = geo.get("husnummer", "")
        letter = raw.get("bokstav", "")

        if not street_id:
            return self._error(adresse, kommunenummer, "address_not_found")

        params = {
            "street": street_name,
            "number": house_number,
            "street_id": street_id,
        }
        if letter:
            params["letter"] = letter

        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            resp = await client.get(OSLO_URL, params=params, headers={"Accept": "application/json"})
            resp.raise_for_status()
            data = resp.json()

        results = data.get("result", [])
        if not results:
            return self._error(adresse, kommunenummer, "address_not_found")

        seen: dict[str, dict] = {}
        for entry in results:
            for punkt in entry.get("HentePunkts", []):
                for tjeneste in punkt.get("Tjenester", []):
                    fraksjon = tjeneste.get("Fraksjon", {}).get("Tekst", "")
                    if not fraksjon or fraksjon in seen:
                        continue

                    iso_date = _parse_date(tjeneste.get("TommeDato", ""))
                    frequency = tjeneste.get("Hyppighet", {}).get("Faktor", 0)
                    datoer = _project_dates(iso_date, frequency, count=3)

                    seen[fraksjon] = {
                        "fraksjon": fraksjon,
                        "neste_henting": datoer[0] if datoer else None,
                        "kommende_datoer": datoer,
                    }

        return {
            "adresse": adresse,
            "kommune": geo.get("kommunenavn", "Oslo"),
            "kommunenummer": kommunenummer,
            "provider": "oslo",
            "hentedager": list(seen.values()),
        }

    def _error(self, adresse, kommunenummer, error_code):
        return {
            "adresse": adresse,
            "kommune": "Oslo",
            "kommunenummer": kommunenummer,
            "provider": "oslo",
            "error": error_code,
        }
