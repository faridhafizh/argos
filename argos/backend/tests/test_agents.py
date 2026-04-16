from argos.backend.agents import DiscoveryAgent, ExtractionAgent, GeolocationAgent, RankingAgent, ValidationAgent
from argos.backend.orchestrator import Orchestrator


def test_validation_agent():
    agent = ValidationAgent()
    events = [{"couple_names": "A & B", "address": "Venue 1"}, {"couple_names": "A & B", "address": "Venue 1"}]
    valid = agent.validate(events)
    assert len(valid) == 1
    assert "id" in valid[0]


def test_ranking_agent():
    agent = RankingAgent()
    events = [{"distance": 10}, {"distance": 5}, {"distance": 15}]
    ranked = agent.rank(events)
    assert ranked[0]["distance"] == 5
    assert ranked[2]["distance"] == 15


def test_geolocation_haversine():
    agent = GeolocationAgent()
    distance = agent._haversine_km(0.0, 0.0, 0.0, 1.0)
    assert 110 <= distance <= 112


def test_orchestrator(monkeypatch):
    orchestrator = Orchestrator()

    monkeypatch.setattr(orchestrator.discovery_agent, "crawl", lambda sources: ["https://example.com/wedding"])
    monkeypatch.setattr(
        orchestrator.extraction_agent,
        "extract",
        lambda url: {"couple_names": "John & Jane", "date": "2026-05-01", "address": "Central Park"},
    )
    monkeypatch.setattr(
        orchestrator.geolocation_agent,
        "geocode",
        lambda address, lat, lng: {"lat": 40.7, "lng": -74.0, "distance": 2.1},
    )

    events = orchestrator.run_swarm_workflow(["example.com"], 40.71, -74.0)
    assert len(events) == 1
    assert events[0]["couple_names"] == "John & Jane"
    assert events[0]["distance"] == 2.1


def test_extraction_heuristic_fallback_without_openai_key(monkeypatch):
    agent = ExtractionAgent()
    monkeypatch.setattr(agent, "api_key", None)
    sample = "Join us to celebrate Alice & Bob at venue Grand Hall, 123 Main Street on 12/06/2026"
    monkeypatch.setattr(agent, "_fetch_text", lambda url: sample)

    data = agent.extract("https://example.com")
    assert data is not None
    assert data["couple_names"] == "Alice & Bob"
