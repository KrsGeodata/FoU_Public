from unittest.mock import AsyncMock


def test_get_renovasjon_success(client, mock_matrikkel_client, mock_renovasjon_client):
    # A valid property should return waste collection data with status 200.
    mock_matrikkel_client.get_eiendom = AsyncMock(return_value={
        "vegadresse": "Storgata 1",
        "postnummerområde": "4612 Kristiansand",
    })
    mock_renovasjon_client.get_hentedager = AsyncMock(return_value={
        "adresse": "Storgata 1, 4612 Kristiansand",
        "kommune": "Kristiansand",
        "kommunenummer": "4204",
        "provider": "avfallsor",
        "hentedager": [
            {
                "fraksjon": "Restavfall",
                "neste_henting": "2026-04-10",
                "kommende_datoer": ["2026-04-10", "2026-04-24"],
            }
        ],
    })

    response = client.get("/property/4204/1/2/0/0/renovasjon")

    assert response.status_code == 200
    data = response.json()
    assert data["kommune"] == "Kristiansand"
    assert len(data["hentedager"]) == 1
    assert data["hentedager"][0]["fraksjon"] == "Restavfall"


def test_get_renovasjon_not_found(client, mock_matrikkel_client):
    # A property that doesn't exist should return 404.
    mock_matrikkel_client.get_eiendom = AsyncMock(return_value=None)

    response = client.get("/property/4204/1/2/0/0/renovasjon")

    assert response.status_code == 404


def test_get_renovasjon_missing_address(client, mock_matrikkel_client):
    # A property without address data should return 200 with empty response.
    mock_matrikkel_client.get_eiendom = AsyncMock(return_value={
        "vegadresse": None,
        "postnummerområde": None,
    })

    response = client.get("/property/4204/1/2/0/0/renovasjon")

    assert response.status_code == 200
    assert response.json()["hentedager"] == []


def test_get_renovasjon_error_response(client, mock_matrikkel_client, mock_renovasjon_client):
    # When renovasjon-service returns an error, route should return 200 with just the address.
    mock_matrikkel_client.get_eiendom = AsyncMock(return_value={
        "vegadresse": "Storgata 1",
        "postnummerområde": "4612 Kristiansand",
    })
    mock_renovasjon_client.get_hentedager = AsyncMock(return_value={
        "error": "unsupported_municipality",
        "message": "Kommune not supported",
    })

    response = client.get("/property/4204/1/2/0/0/renovasjon")

    assert response.status_code == 200
    assert response.json()["adresse"] == "Storgata 1, 4612 Kristiansand"
    assert response.json()["hentedager"] == []


def test_get_renovasjon_client_error(error_client, mock_matrikkel_client):
    # If the client raises an exception, the route should return 500.
    mock_matrikkel_client.get_eiendom = AsyncMock(side_effect=Exception("Connection failed"))

    response = error_client.get("/property/4204/1/2/0/0/renovasjon")

    assert response.status_code == 500
