import httpx
from datetime import datetime
from bs4 import BeautifulSoup
from urllib.parse import urlencode
from .base import Provider
from app.config import HTTP_TIMEOUT

BASE_URL = "https://www.stavanger.kommune.no"
HEADERS = {
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "X-Requested-With": "XMLHttpRequest",
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/605.1.15 (KHTML, like Gecko) "
        "Version/26.2 Safari/605.1.15"
    ),
    "Referer": f"{BASE_URL}/renovasjon-og-miljo/tommekalender/finn-kalender/",
}

NORSK_MAANEDER = {
    "januar": 1, "februar": 2, "mars": 3, "april": 4,
    "mai": 5, "juni": 6, "juli": 7, "august": 8,
    "september": 9, "oktober": 10, "november": 11, "desember": 12,
}


def _parse_stavanger_date(date_str: str, month_str: str) -> str | None:
    """
    Parse Stavanger date.
    date_str: '09.03 - mandag' or '09.'
    month_str: '3-2026' (month-year) or '2026-03' (year-month)
    """
    try:
        # Extract leading DD.MM or DD. from date_str
        day_part = date_str.split(" ")[0].rstrip(".")
        if "." in day_part:
            # Format: "09.03" — day and month both present
            day, month = map(int, day_part.split("."))
            # Extract year from month_str
            parts = month_str.split("-")
            year = int(max(parts, key=len))  # pick the 4-digit part
        else:
            day = int(day_part)
            parts = month_str.split("-")
            if len(parts[0]) == 4:
                year, month = int(parts[0]), int(parts[1])
            else:
                month, year = int(parts[0]), int(parts[1])
        return datetime(year, month, day).strftime("%Y-%m-%d")
    except Exception:
        return None


class StavangerProvider(Provider):
    async def get_hentedager(self, adresse: str, kommunenummer: str) -> dict:
        # Step 1: search address (Stavanger API doesn't accept city suffix)
        street_only = adresse.split(",")[0].strip()

        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            resp = await client.get(
                f"{BASE_URL}/api/renovasjonservice/GroupedAddressSearch",
                params={"address": street_only},
                headers=HEADERS,
            )
            resp.raise_for_status()
            results = resp.json()
            if not results:
                return self._error(adresse, kommunenummer, "address_not_found")

            match = results[0]

            # Step 2: fetch HTML calendar
            params = {
                "ids": match["id"],
                "municipality": match.get("kommune", "Stavanger"),
                "gnumber": match.get("gNr", ""),
                "bnumber": match.get("bNr", ""),
                "snumber": match.get("sNr", 0),
            }
            page_url = (
                f"{BASE_URL}/renovasjon-og-miljo/tommekalender/finn-kalender/show"
                f"?{urlencode(params)}"
            )
            page_resp = await client.get(
                page_url,
                headers={**HEADERS, "Accept": "text/html,application/xhtml+xml"},
            )
            page_resp.raise_for_status()

        # Step 3: parse calendar
        soup = BeautifulSoup(page_resp.text, "html.parser")
        fraksjon_map: dict[str, list[str]] = {}

        for tbody in soup.select("table.waste-calendar tbody"):
            month = tbody.get("data-month", "")
            for row in tbody.select("tr.waste-calendar__item"):
                cells = row.find_all("td")
                if len(cells) < 2:
                    continue
                date_text = cells[0].get_text(strip=True)
                iso = _parse_stavanger_date(date_text, month)
                if not iso:
                    continue
                for img in cells[1].find_all("img"):
                    fraksjon = img.get("alt", "Ukjent")
                    fraksjon_map.setdefault(fraksjon, []).append(iso)

        hentedager = []
        for fraksjon, datoer in fraksjon_map.items():
            datoer_sorted = sorted(datoer)
            hentedager.append({
                "fraksjon": fraksjon,
                "neste_henting": datoer_sorted[0] if datoer_sorted else None,
                "kommende_datoer": datoer_sorted,
            })

        return {
            "adresse": adresse,
            "kommune": "Stavanger",
            "kommunenummer": kommunenummer,
            "provider": "stavanger",
            "hentedager": hentedager,
        }

    def _error(self, adresse, kommunenummer, error):
        return {
            "adresse": adresse,
            "kommune": None,
            "kommunenummer": kommunenummer,
            "provider": "stavanger",
            "error": error,
        }
