from argos.backend.agents import DiscoveryAgent, ExtractionAgent, GeolocationAgent, ValidationAgent, RankingAgent
from argos.backend.orchestrator import Orchestrator

def test_discovery_agent():
    agent = DiscoveryAgent()
    urls = agent.crawl(["source1", "source2"])
    assert len(urls) == 2

def test_extraction_agent():
    agent = ExtractionAgent()
    data = agent.extract("http://test.com")
    assert data is not None
    assert "couple_names" in data

def test_geolocation_agent():
    agent = GeolocationAgent()
    data = agent.geocode("123 Test St", 0.0, 0.0)
    assert data is not None
    assert "lat" in data
    assert "lng" in data
    assert "distance" in data

def test_validation_agent():
    agent = ValidationAgent()
    events = [{"raw": "data"}]
    valid = agent.validate(events)
    assert len(valid) == 1
    assert valid[0]["confidence_score"] == 0.95
    assert "id" in valid[0]

def test_ranking_agent():
    agent = RankingAgent()
    events = [{"distance": 10}, {"distance": 5}, {"distance": 15}]
    ranked = agent.rank(events)
    assert ranked[0]["distance"] == 5
    assert ranked[2]["distance"] == 15

def test_orchestrator():
    orchestrator = Orchestrator()
    events = orchestrator.run_swarm_workflow(["source1"], 0.0, 0.0)
    assert len(events) > 0
    assert "couple_names" in events[0]
    assert "distance" in events[0]
    assert "id" in events[0]
