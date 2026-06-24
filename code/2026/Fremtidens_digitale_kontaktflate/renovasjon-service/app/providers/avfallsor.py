import httpx
from .base import Provider
from app.config import HTTP_TIMEOUT

ADDRESS_API = "https://avfallsor.no/wp-json/addresses/v1/address"
CALENDAR_API = "https://avfallsor.no/wp-json/pickup-calendar/v1/collections/property-id/{property_id}"


class AvfallSorProvider(Provider):
    async def get_hentedager(self, adresse: str, kommunenummer: str) -> dict:
        # Step 1: resolve property_id from address
        street_only = adresse.split(",")[0].strip()

        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            resp = await client.get(
                ADDRESS_API,
                params={"lookup_term": street_only},
            )
            resp.raise_for_status()
            results = resp.json()
            if not results:
                return self._error(adresse, kommunenummer, "address_not_found")

            # Extract property ID from href: .../finn-hentedag/<uuid>/
            href = results[0].get("href", "")
            property_id = href.rstrip("/").split("/")[-1]

            # Step 2: fetch pickup calendar via REST API
            cal_resp = await client.get(
                CALENDAR_API.format(property_id=property_id),
            )
            cal_resp.raise_for_status()
            collections = cal_resp.json().get("collections", [])

        # Step 3: group by fraksjon
        fraksjon_datoer: dict[str, list[str]] = {}
        for day in collections:
            for item in day.get("items", []):
                fraksjon = item.get("fraksjon", "Ukjent")
                dato = item.get("dato", "")
                if dato:
                    iso = dato[:10]  # "2026-03-09T00:00:00" -> "2026-03-09"
                    fraksjon_datoer.setdefault(fraksjon, []).append(iso)

        hentedager = []
        for fraksjon, datoer in fraksjon_datoer.items():
            datoer_sorted = sorted(set(datoer))
            hentedager.append({
                "fraksjon": fraksjon,
                "neste_henting": datoer_sorted[0] if datoer_sorted else None,
                "kommende_datoer": datoer_sorted,
            })

        kommune_navn = "Kristiansand" if kommunenummer == "4204" else "Vennesla"
        return {
            "adresse": adresse,
            "kommune": kommune_navn,
            "kommunenummer": kommunenummer,
            "provider": "avfallsor",
            "hentedager": hentedager,
        }

    def _error(self, adresse, kommunenummer, error_code):
        return {
            "adresse": adresse,
            "kommune": None,
            "kommunenummer": kommunenummer,
            "provider": "avfallsor",
            "error": error_code,
        }
