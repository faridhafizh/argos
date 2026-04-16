from fastapi.testclient import TestClient
from argos.backend.main import app

client = TestClient(app)

def test_discover_endpoint():
    response = client.post("/discover", json={"urls": ["http://test1.com", "http://test2.com"]})
    assert response.status_code == 200
    assert response.json()["urls_queued"] == 2

def test_nearby_endpoint():
    response = client.get("/events/nearby?lat=-6.2&lng=106.8&radius=15")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert "couple_names" in data[0]
    assert "distance" in data[0]

def test_extract_endpoint():
    response = client.post("/extract?url=http://test.com")
    assert response.status_code == 200
    assert response.json()["status"] == "success"
