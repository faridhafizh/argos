from typing import Any, Dict, List

from argos.backend.agents import (
    DiscoveryAgent,
    ExtractionAgent,
    GeolocationAgent,
    RankingAgent,
    ValidationAgent,
)


class Orchestrator:
    def __init__(self, llm_model: str | None = None):
        self.discovery_agent = DiscoveryAgent()
        self.extraction_agent = ExtractionAgent(model=llm_model)
        self.geolocation_agent = GeolocationAgent()
        self.validation_agent = ValidationAgent()
        self.ranking_agent = RankingAgent()

    def run_swarm_workflow(self, sources: List[str], user_lat: float, user_lng: float) -> List[Dict[str, Any]]:
        raw_urls = self.discovery_agent.crawl(sources)

        events_data = []
        for url in raw_urls:
            extracted_data = self.extraction_agent.extract(url)
            if extracted_data:
                extracted_data["source_url"] = url
                events_data.append(extracted_data)

        geo_located_events = []
        for event in events_data:
            geo_data = self.geolocation_agent.geocode(event.get("address", ""), user_lat, user_lng)
            if geo_data:
                event.update(geo_data)
                geo_located_events.append(event)

        valid_events = self.validation_agent.validate(geo_located_events)
        return self.ranking_agent.rank(valid_events)
