from fastapi.testclient import TestClient
from fastapi import FastAPI
from backend_api.roads.exitarea import router as exitarea_router
from unittest.mock import MagicMock, patch

app = FastAPI()
app.include_router(exitarea_router)

client = TestClient(app)


def test_fetch_all_avkjorsler_success():
    # Fake Supabase response
    fake_data = [
        {
            "id": 1,
            "geometry": {"type": "Point", "coordinates": [10, 60]},
            "planid": 123
        }
    ]

    # Fake execute() return object
    fake_execute = MagicMock()
    fake_execute.data = fake_data

    # Mock supabase.table().select().limit().execute()
    with patch("backend_api.roads.exitarea.supabase") as mock_supabase:
        mock_supabase.table.return_value.select.return_value.limit.return_value.execute.return_value = fake_execute

        # Perform API call
        response = client.get("/exitarea/FetchAllAvkjorsler")

    # Assert API call succeeded
    assert response.status_code == 200

    body = response.json()
    assert body is not None
    

    def test_post_avkjorsler_by_planid_success():
        fake_data = [
        {
            "id": 1,
            "geometry": {"type": "Point", "coordinates": [10, 60]},
            "planid": 999
        }
    ]

    fake_execute = MagicMock()
    fake_execute.data = fake_data

    with patch("backend_api.roads.exitarea.supabase") as mock_supabase:
        mock_supabase.table.return_value.select.return_value.eq.return_value.limit.return_value.execute.return_value = fake_execute

        response = client.post("/exitarea/AvkjorslerByPlanid", json={"planid": 999})

    assert response.status_code == 200
    assert response.json() is not None