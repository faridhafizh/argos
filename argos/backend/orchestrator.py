from typing import List, Dict, Any
from argos.backend.agents import DiscoveryAgent, ExtractionAgent, GeolocationAgent, ValidationAgent, RankingAgent

class Orchestrator:
    def __init__(self):
        self.discovery_agent = DiscoveryAgent()
        self.extraction_agent = ExtractionAgent()
        self.geolocation_agent = GeolocationAgent()
        self.validation_agent = ValidationAgent()
        self.ranking_agent = RankingAgent()

    def run_swarm_workflow(self, sources: List[str], user_lat: float, user_lng: float) -> List[Dict[str, Any]]:
        # 1. Discover potential URLs
        raw_urls = self.discovery_agent.crawl(sources)

        events_data = []
        # 2. Extract data from each URL
        for url in raw_urls:
            extracted_data = self.extraction_agent.extract(url)
            if extracted_data:
                extracted_data["source_url"] = url
                events_data.append(extracted_data)

        # 3. Geolocation & Distance Calculation
        geo_located_events = []
        for event in events_data:
            geo_data = self.geolocation_agent.geocode(event["address"], user_lat, user_lng)
            if geo_data:
                event.update(geo_data)
                geo_located_events.append(event)

        # 4. Validation (remove duplicates/fakes)
        valid_events = self.validation_agent.validate(geo_located_events)

        # 5. Ranking
        ranked_events = self.ranking_agent.rank(valid_events)

        return ranked_events
