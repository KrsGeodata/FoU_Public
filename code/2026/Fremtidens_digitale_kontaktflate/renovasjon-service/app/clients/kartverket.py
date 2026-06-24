import re
import httpx

from app.config import KARTVERKET_SOK_URL, HTTP_TIMEOUT

# Matches e.g. "Storgata 1", "Kongens gate 12B", "Ole Bulls vei 3", "Vei 3M"
_STREET_RE = re.compile(r"^(.*?)\s+(\d+)\s*([A-Za-z]?)$")
# Matches "3269 LARVIK" → postnummer + poststed
_CITY_RE = re.compile(r"^(\d{4})\s+(.+)$")


async def lookup_adresse(adresse: str) -> dict:
    """
    Resolve a free-text Norwegian address using Kartverket.

    Accepts formats like:
      - "Storgata 1, Sarpsborg"
      - "Madlaveien 10, Stavanger"
      - "Kongens gate 12B, 3269 LARVIK"
      - "Storgata 1"  (less precise — picks first match nationwide)

    Returns dict with: kommunenummer, kommunenavn, adressenavn, husnummer, postnummer, poststed.
    Raises ValueError if no match found.
    """
    street_part = adresse.strip()
    city_part = None

    if "," in adresse:
        street_part, city = adresse.split(",", 1)
        street_part = street_part.strip()
        city_part = city.strip()

    # Parse street name, house number (digits), and optional letter (bokstav)
    m = _STREET_RE.match(street_part)
    if m and city_part:
        gatenavn = m.group(1).strip()
        husnr = m.group(2).strip()
        bokstav = m.group(3).strip()

        params: dict = {"adressenavn": gatenavn, "nummer": husnr}
        if bokstav:
            params["bokstav"] = bokstav

        # Split "3269 LARVIK" into postnummer + poststed, or treat as plain poststed
        cm = _CITY_RE.match(city_part.upper())
        if cm:
            params["postnummer"] = cm.group(1)
            params["poststed"] = cm.group(2)
        else:
            params["poststed"] = city_part.upper()

        hit = await _search(**params)
        if hit:
            return _format(hit)

    # Fallback: use the full address string as-is via sok
    hit = await _search(sok=adresse)
    if hit:
        return _format(hit)

    raise ValueError(f"Address not found: {adresse!r}")


async def _search(**params) -> dict | None:
    params["treffPerSide"] = 1
    async with httpx.AsyncClient() as client:
        response = await client.get(KARTVERKET_SOK_URL, params=params, timeout=HTTP_TIMEOUT)
        response.raise_for_status()
        treff = response.json().get("adresser", [])
        return treff[0] if treff else None


def _format(hit: dict) -> dict:
    return {
        "kommunenummer": hit.get("kommunenummer"),
        "kommunenavn": hit.get("kommunenavn"),
        "adressenavn": hit.get("adressenavn"),
        "husnummer": str(hit.get("nummer", "")),
        "postnummer": hit.get("postnummer"),
        "poststed": hit.get("poststed"),
        "raw": hit,
    }
