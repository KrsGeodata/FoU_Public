from unittest.mock import AsyncMock


def test_get_municipal_fees_success(client, mock_matrikkel_client):
    # A valid property should return fee data with status 200.
    mock_matrikkel_client.get_avgifter = AsyncMock(return_value=[
        {
            "gebyr": "Vann",
            "grunnlag": "150 m2",
            "beløp": "1500",
            "årsbeløp": "6000",
            "fra_dato": "2026-01-01",
            "til_dato": "2026-12-31",
        }
    ])

    response = client.get("/property/4204/1/2/0/0/municipal-fees")

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["gebyr"] == "Vann"
    assert response.json()[0]["beløp"] == "1500"


def test_get_municipal_fees_not_found(client, mock_matrikkel_client):
    # A property with no fees should return 404.
    mock_matrikkel_client.get_avgifter = AsyncMock(return_value=[])

    response = client.get("/property/4204/1/2/0/0/municipal-fees")

    assert response.status_code == 404


def test_get_municipal_fees_empty_list(client, mock_matrikkel_client):
    # None from client means no fee record found -> 404.
    mock_matrikkel_client.get_avgifter = AsyncMock(return_value=None)

    response = client.get("/property/4204/1/2/0/0/municipal-fees")

    assert response.status_code == 404


def test_get_municipal_fees_client_error(error_client, mock_matrikkel_client):
    # If the client raises an exception, the route should return 500.
    mock_matrikkel_client.get_avgifter = AsyncMock(side_effect=Exception("Connection failed"))

    response = error_client.get("/property/4204/1/2/0/0/municipal-fees")

    assert response.status_code == 500
