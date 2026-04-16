from typing import List, Dict, Any, Optional
import math
import uuid
import datetime

class DiscoveryAgent:
    def crawl(self, sources: List[str]) -> List[str]:
        # Mock logic: Return a list of hypothetical found URLs
        return [f"https://example.com/invite_{i}" for i in range(len(sources))]

class ExtractionAgent:
    def extract(self, url: str) -> Optional[Dict[str, Any]]:
        # Mock logic: Extract couple names, date, address
        return {
            "couple_names": "Mock Couple",
            "date": (datetime.datetime.now() + datetime.timedelta(days=7)).isoformat(),
            "address": "123 Mock Street, Fake City"
        }

class GeolocationAgent:
    def geocode(self, address: str, user_lat: float, user_lng: float) -> Optional[Dict[str, Any]]:
        # Mock logic: Provide fake lat/lng and calculate distance
        # Simple euclidean distance mock for prototype
        mock_lat = user_lat + 0.05
        mock_lng = user_lng + 0.05
        distance = math.sqrt((user_lat - mock_lat)**2 + (user_lng - mock_lng)**2) * 111 # rough km conversion

        return {
            "lat": mock_lat,
            "lng": mock_lng,
            "distance": distance
        }

class ValidationAgent:
    def validate(self, events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        # Mock logic: Add confidence score, filter out fakes
        valid_events = []
        for event in events:
            event["confidence_score"] = 0.95
            event["id"] = str(uuid.uuid4())
            valid_events.append(event)
        return valid_events

class RankingAgent:
    def rank(self, events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        # Mock logic: Sort by distance
        return sorted(events, key=lambda x: x.get("distance", float('inf')))
