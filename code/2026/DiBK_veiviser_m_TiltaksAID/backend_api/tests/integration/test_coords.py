from fastapi.testclient import TestClient
from fastapi import FastAPI
from backend_api.maps.coords import router as coords_router
from unittest.mock import AsyncMock, patch
import httpx

app = FastAPI()
app.include_router(coords_router)

client = TestClient(app)

def test_wms_proxy_success():
    mock_response = httpx.Response(
        status_code=200,
        content=b"fake-image",
        headers={"content-type": "image/png"}
    )

    async_mock = AsyncMock(return_value=mock_response)

    with patch("httpx.AsyncClient.get", async_mock):
        response = client.get(
            "/coords/wms/proxy",
            params={
                "layers": "norges_grunnkart",
                "width": 256,
                "height": 256,
                "bbox": "0,0,10,10",
                "crs": "EPSG:3857",
            }
        )

    assert response.status_code == 200
    assert response.content == b"fake-image"