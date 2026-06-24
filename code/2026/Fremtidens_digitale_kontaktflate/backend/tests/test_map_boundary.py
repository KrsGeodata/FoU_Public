from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest

from app.routes.map import _boundary_cache, _extract_coords, _parse_gml
from defusedxml import ElementTree as ET


@pytest.fixture(autouse=True)
def _clear_boundary_cache():
    _boundary_cache.clear()


_VALID_GML = """<?xml version="1.0" encoding="UTF-8"?>
<wfs:FeatureCollection
    xmlns:wfs="http://www.opengis.net/wfs/2.0"
    xmlns:gml="http://www.opengis.net/gml/3.2"
    xmlns:app="http://skjema.geonorge.no/SOSI/produktspesifikasjon/Matrikkelen-Eiendomskart-Teig/20211101">
  <wfs:member>
    <app:Teig>
      <app:område>
        <gml:Polygon srsName="urn:ogc:def:crs:OGC:1.3:CRS84">
          <gml:exterior>
            <gml:LinearRing>
              <gml:posList srsDimension="2">
                7.99 58.14 8.00 58.14 8.00 58.15 7.99 58.15 7.99 58.14
              </gml:posList>
            </gml:LinearRing>
          </gml:exterior>
        </gml:Polygon>
      </app:område>
    </app:Teig>
  </wfs:member>
</wfs:FeatureCollection>
"""


def test_parse_gml_valid_returns_feature():
    feature = _parse_gml(_VALID_GML)
    assert feature is not None
    assert feature["type"] == "Feature"
    assert feature["geometry"]["type"] == "Polygon"
    assert len(feature["geometry"]["coordinates"]) == 1
    assert feature["geometry"]["coordinates"][0][0] == [7.99, 58.14]


def test_parse_gml_empty_returns_none():
    empty_collection = (
        '<?xml version="1.0"?><wfs:FeatureCollection '
        'xmlns:wfs="http://www.opengis.net/wfs/2.0"/>'
    )
    assert _parse_gml(empty_collection) is None


def test_parse_gml_malformed_returns_none():
    assert _parse_gml("<not-valid-xml") is None


def test_extract_coords_single_ring():
    teig = ET.fromstring(_VALID_GML).find(
        ".//{http://skjema.geonorge.no/SOSI/produktspesifikasjon/Matrikkelen-Eiendomskart-Teig/20211101}Teig"
    )
    coords = _extract_coords(teig)
    assert coords is not None
    assert len(coords) == 1
    assert coords[0][0] == [7.99, 58.14]
    assert coords[0][-1] == [7.99, 58.14]  # closed ring


def test_extract_coords_no_poslist_returns_none():
    teig = ET.fromstring(
        '<app:Teig xmlns:app="http://skjema.geonorge.no/SOSI/produktspesifikasjon/Matrikkelen-Eiendomskart-Teig/20211101"/>'
    )
    assert _extract_coords(teig) is None


def test_get_property_boundary_success(client, mock_matrikkel_client):
    coords = MagicMock(lat=58.145, lon=7.995)
    with patch("app.routes.map.MapRepository") as mock_repo:
        mock_repo.return_value.get_coordinates = AsyncMock(return_value=coords)

        mock_response = MagicMock(status_code=200, text=_VALID_GML)
        mock_http_client = AsyncMock()
        mock_http_client.get = AsyncMock(return_value=mock_response)
        mock_http_client.__aenter__ = AsyncMock(return_value=mock_http_client)
        mock_http_client.__aexit__ = AsyncMock(return_value=None)

        with patch("app.routes.map.httpx.AsyncClient", return_value=mock_http_client):
            response = client.get("/map/4204/1/2/0/0/boundary")

    assert response.status_code == 200
    body = response.json()
    assert body["type"] == "Feature"
    assert body["geometry"]["type"] == "Polygon"


def test_get_property_boundary_wfs_error_returns_404(client, mock_matrikkel_client):
    coords = MagicMock(lat=58.145, lon=7.995)
    with patch("app.routes.map.MapRepository") as mock_repo:
        mock_repo.return_value.get_coordinates = AsyncMock(return_value=coords)

        mock_http_client = AsyncMock()
        mock_http_client.get = AsyncMock(side_effect=httpx.HTTPError("boom"))
        mock_http_client.__aenter__ = AsyncMock(return_value=mock_http_client)
        mock_http_client.__aexit__ = AsyncMock(return_value=None)

        with patch("app.routes.map.httpx.AsyncClient", return_value=mock_http_client):
            response = client.get("/map/4204/1/2/0/0/boundary")

    assert response.status_code == 404


def test_get_property_boundary_no_coords_returns_404(client, mock_matrikkel_client):
    with patch("app.routes.map.MapRepository") as mock_repo:
        mock_repo.return_value.get_coordinates = AsyncMock(return_value=None)
        response = client.get("/map/4204/1/2/0/0/boundary")
    assert response.status_code == 404
