# Standard library
import logging
from xml.etree.ElementTree import Element  # type-only; parsing uses defusedxml

# Third-party
import httpx
from defusedxml import ElementTree as ET
from fastapi import APIRouter, Depends, HTTPException

# Local
from app.clients.matrikkel_client import MatrikkelClient
from app.dependencies import get_matrikkel_client, get_matrikkelnummer
from app.repositories.map import MapRepository
from app.schema.map import MapCoordinatesResponse

logger = logging.getLogger(__name__)
router = APIRouter()

# In-memory cache for boundary polygons. Property boundaries rarely change, and
# caching prevents repeated WFS calls for the same coordinates (React re-renders,
# Strict Mode double-invocation) which would otherwise trigger GeoNorge rate limits.
_boundary_cache: dict[tuple[float, float], dict] = {}

_WFS_URL = "https://wfs.geonorge.no/skwms1/wfs.matrikkelen-eiendomskart-teig"
_WFS_NS = {
    "gml": "http://www.opengis.net/gml/3.2",
    "app": "http://skjema.geonorge.no/SOSI/produktspesifikasjon/Matrikkelen-Eiendomskart-Teig/20211101",
}

_CONTAINS_FILTER = (
    '<Filter xmlns="http://www.opengis.net/fes/2.0" xmlns:gml="http://www.opengis.net/gml/3.2">'
    "<Contains>"
    "<ValueReference>app:område</ValueReference>"
    '<gml:Point srsName="urn:ogc:def:crs:OGC:1.3:CRS84" gml:id="p1">'
    "<gml:pos>{lon} {lat}</gml:pos>"
    "</gml:Point>"
    "</Contains>"
    "</Filter>"
)


@router.get("/map/{kommunenr}/{gnr}/{bnr}/{fnr}/{snr}", response_model=MapCoordinatesResponse)
async def get_map_coordinates(
    kommunenr: str, gnr: int, bnr: int, fnr: int, snr: int,
    client: MatrikkelClient = Depends(get_matrikkel_client),
):
    """Retrieve WGS84 coordinates for a property by matrikkelnummer."""
    mnr = get_matrikkelnummer(kommunenr, gnr, bnr, fnr, snr)
    repo = MapRepository(client)
    result = await repo.get_coordinates(mnr)
    if not result:
        raise HTTPException(status_code=404, detail="Property not found")
    return result


@router.get("/map/{kommunenr}/{gnr}/{bnr}/{fnr}/{snr}/boundary")
async def get_property_boundary(
    kommunenr: str, gnr: int, bnr: int, fnr: int, snr: int,
    client: MatrikkelClient = Depends(get_matrikkel_client),
):
    """Fetch GeoJSON property boundary (teig) from GeoNorge WFS."""
    mnr = get_matrikkelnummer(kommunenr, gnr, bnr, fnr, snr)
    repo = MapRepository(client)
    coords = await repo.get_coordinates(mnr)
    if not coords or coords.lat is None or coords.lon is None:
        raise HTTPException(status_code=404, detail="Property coordinates not found")

    boundary = await _fetch_boundary(coords.lat, coords.lon)
    if not boundary:
        raise HTTPException(status_code=404, detail="Property boundary not found")
    return boundary


async def _fetch_boundary(lat: float, lon: float) -> dict | None:
    cache_key = (round(lat, 5), round(lon, 5))
    if cache_key in _boundary_cache:
        return _boundary_cache[cache_key]

    params = {
        "service": "WFS",
        "version": "2.0.0",
        "request": "GetFeature",
        "typeName": "app:Teig",
        "srsName": "urn:ogc:def:crs:OGC:1.3:CRS84",
        "FILTER": _CONTAINS_FILTER.format(lon=lon, lat=lat),
        "count": "1",
    }
    try:
        async with httpx.AsyncClient(timeout=15.0) as http_client:
            response = await http_client.get(_WFS_URL, params=params)
        if response.status_code != 200:
            return None
        if "<ServiceException>" in response.text:
            logger.warning("GeoNorge WFS rate limited (lat=%.5f, lon=%.5f)", lat, lon)
            return None
        result = _parse_gml(response.text)
        if result is not None:
            _boundary_cache[cache_key] = result
        return result
    except (httpx.HTTPError, ET.ParseError, ValueError):
        return None


def _parse_gml(gml_text: str) -> dict | None:
    try:
        root = ET.fromstring(gml_text)
    except ET.ParseError:
        return None

    teig = root.find(".//app:Teig", _WFS_NS)
    if teig is None:
        return None

    coords = _extract_coords(teig)
    if not coords:
        return None

    return {"type": "Feature", "geometry": {"type": "Polygon", "coordinates": coords}, "properties": {}}



def _extract_coords(teig_el: Element) -> list | None:
    # CRS84 (urn:ogc:def:crs:OGC:1.3:CRS84) emits coordinates as (lon, lat) pairs —
    # which is what GeoJSON expects. Note: EPSG:4326 in GML 3.2 would be (lat, lon)
    # and would need swapping. Keep srsName=CRS84 in the WFS request to avoid that.
    pos_lists = teig_el.findall(".//gml:posList", _WFS_NS)
    if not pos_lists:
        return None
    rings = []
    for pl in pos_lists:
        text = (pl.text or "").split()
        dim = int(pl.get("srsDimension", "2"))
        if len(text) < dim * 3:
            continue
        ring = [[float(text[i]), float(text[i + 1])] for i in range(0, len(text) - dim + 1, dim)]
        rings.append(ring)
    return rings if rings else None
