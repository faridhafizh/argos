from fastapi.testclient import TestClient

from argos.backend.main import app

client = TestClient(app)


def test_discover_endpoint():
    response = client.post("/discover", json={"urls": ["http://test1.com", "http://test2.com"]})
    assert response.status_code == 200
    assert response.json()["urls_queued"] == 2


def test_discover_endpoint_rejects_empty_urls():
    response = client.post("/discover", json={"urls": []})
    assert response.status_code == 400


def test_nearby_endpoint(monkeypatch):
    from argos.backend import main

    class DummyOrchestrator:
        def __init__(self, llm_model=None):
            pass

        def run_swarm_workflow(self, sources, lat, lng):
            return [
                {
                    "id": "1",
                    "couple_names": "Romeo & Juliet",
                    "date": "2026-04-20",
                    "address": "Verona",
                    "lat": lat,
                    "lng": lng,
                    "source_url": "https://example.com",
                    "distance": 1.5,
                },
                {
                    "id": "2",
                    "couple_names": "Far Away",
                    "date": "2026-04-20",
                    "address": "Far",
                    "lat": lat,
                    "lng": lng,
                    "source_url": "https://example.com/2",
                    "distance": 99,
                },
            ]

    monkeypatch.setattr(main, "Orchestrator", DummyOrchestrator)

    response = client.get("/events/nearby?lat=40.7&lng=-74.0&radius=10")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["couple_names"] == "Romeo & Juliet"


def test_extract_endpoint(monkeypatch):
    from argos.backend import main

    class DummyOrchestrator:
        def __init__(self, llm_model=None):
            self.extraction_agent = self

        def extract(self, url):
            return {"couple_names": "John & Jane", "date": "2026-05-01", "address": "Central Park"}

    monkeypatch.setattr(main, "Orchestrator", DummyOrchestrator)

    response = client.post("/extract?url=http://test.com")
    assert response.status_code == 200
    assert response.json()["status"] == "success"
