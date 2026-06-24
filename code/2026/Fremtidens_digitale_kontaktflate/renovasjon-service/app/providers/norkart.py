import httpx
from datetime import datetime
from .base import Provider
from app.config import NORKART_APP_KEY, NORKART_PROXY, NORKART_API_BASE, HTTP_TIMEOUT

NORSK_MAANEDER = {
    "januar": 1, "februar": 2, "mars": 3, "april": 4,
    "mai": 5, "juni": 6, "juli": 7, "august": 8,
    "september": 9, "oktober": 10, "november": 11, "desember": 12,
}


def _parse_norkart_date(date_str: str) -> str | None:
    """Convert Norkart date string (e.g. '10. mars 2026') to ISO 8601."""
    parts = date_str.strip().split()
    if len(parts) == 3:
        try:
            day = int(parts[0].rstrip("."))
            month = NORSK_MAANEDER.get(parts[1].lower())
            year = int(parts[2])
            if month:
                return datetime(year, month, day).strftime("%Y-%m-%d")
        except (ValueError, TypeError):
            pass
    return None


class NorkartProvider(Provider):
    async def get_hentedager(self, adresse: str, kommunenummer: str) -> dict:
        headers = {
            "Kommunenr": kommunenummer,
            "RenovasjonAppKey": NORKART_APP_KEY,
            "Accept": "*/*",
        }

        # Resolve gatekode via Kartverket
        from app.clients.kartverket import lookup_adresse
        geo = await lookup_adresse(adresse)

        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            gatekode_resp = await client.get(
                "https://ws.geonorge.no/adresser/v1/sok",
                params={
                    "adressenavn": geo["adressenavn"],
                    "nummer": geo["husnummer"],
                    "kommunenummer": kommunenummer,
                    "treffPerSide": 1,
                },
            )
            hits = gatekode_resp.json().get("adresser", [])
            if not hits:
                return self._error(adresse, kommunenummer, "address_not_found")

            hit = hits[0]
            gatekode = hit["adressekode"]
            normalized_gatenavn = hit["adressenavn"]

            # Fetch tommekalender
            target = (
                f"{NORKART_API_BASE}/tommekalender/"
                f"?kommunenr={kommunenummer}"
                f"&gatenavn={normalized_gatenavn}%20"
                f"&gatekode={gatekode}"
                f"&husnr={geo['husnummer']}"
            )
            url = f"{NORKART_PROXY}?server={target}"
            resp = await client.get(url, headers=headers)
            resp.raise_for_status()
            raw = resp.json()

            # Fetch fraksjon names
            fraksjon_url = f"{NORKART_PROXY}?server={NORKART_API_BASE}/fraksjoner/"
            fraksjon_resp = await client.get(fraksjon_url, headers=headers)
            fraksjon_map = {f["Id"]: f["Navn"] for f in fraksjon_resp.json()}

        hentedager = []
        for item in raw:
            fraksjon_id = item.get("FraksjonId")
            fraksjon_navn = fraksjon_map.get(fraksjon_id, str(fraksjon_id))

            # API returns either Tommedatoer (ISO strings) or Tommedager (dicts with Dato field)
            raw_datoer = item.get("Tommedatoer") or []
            if raw_datoer and isinstance(raw_datoer[0], str):
                # New format: ["2026-03-10T00:00:00", ...]
                datoer = [d[:10] for d in raw_datoer if d]
            else:
                # Old format: [{"Dato": "10. mars 2026"}, ...]
                datoer = [
                    _parse_norkart_date(t["Dato"])
                    for t in item.get("Tommedager", [])
                ]

            datoer_sorted = sorted(d for d in datoer if d)
            hentedager.append({
                "fraksjon": fraksjon_navn,
                "neste_henting": datoer_sorted[0] if datoer_sorted else None,
                "kommende_datoer": datoer_sorted,
            })

        return {
            "adresse": adresse,
            "kommune": geo["kommunenavn"],
            "kommunenummer": kommunenummer,
            "provider": "norkart",
            "hentedager": hentedager,
        }

    def _error(self, adresse, kommunenummer, error_code):
        return {
            "adresse": adresse,
            "kommune": None,
            "kommunenummer": kommunenummer,
            "provider": "norkart",
            "error": error_code,
        }
