from __future__ import annotations

import datetime
import math
import os
import re
import uuid
from typing import Any, Dict, List, Optional

import httpx


class DiscoveryAgent:
    """Collects reachable source URLs from user-provided domains/URLs."""

    def crawl(self, sources: List[str]) -> List[str]:
        urls: List[str] = []
        for source in sources:
            source = source.strip()
            if not source:
                continue
            if not source.startswith(("http://", "https://")):
                source = f"https://{source}"
            urls.append(source)

        reachable_urls: List[str] = []
        with httpx.Client(timeout=10.0, follow_redirects=True) as client:
            for url in urls:
                try:
                    response = client.get(url)
                    if response.status_code < 400:
                        reachable_urls.append(str(response.url))
                except httpx.HTTPError:
                    continue
        return reachable_urls


class ExtractionAgent:
    """Extracts wedding info from invitation pages using OpenAI when configured."""

    def __init__(self, model: Optional[str] = None):
        self.model = model or os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        self.api_key = os.getenv("OPENAI_API_KEY")

    def _fetch_text(self, url: str) -> Optional[str]:
        try:
            response = httpx.get(url, timeout=15.0, follow_redirects=True)
            response.raise_for_status()
        except httpx.HTTPError:
            return None

        # Best-effort text extraction from HTML.
        text = re.sub(r"<script[^>]*>.*?</script>", " ", response.text, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r"<style[^>]*>.*?</style>", " ", text, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r"<[^>]+>", " ", text)
        text = re.sub(r"\s+", " ", text).strip()
        return text[:9000]

    def _heuristic_extract(self, text: str) -> Optional[Dict[str, Any]]:
        # Heuristic fallback with no LLM key.
        couple_match = re.search(r"([A-Z][a-z]+\s*&\s*[A-Z][a-z]+)", text)
        address_match = re.search(r"(?:at|venue)\s+([A-Za-z0-9,\-. ]{10,120})", text, flags=re.IGNORECASE)
        date_match = re.search(r"(\d{1,2}[\-/]\d{1,2}[\-/]\d{2,4})", text)

        if not couple_match or not address_match:
            return None

        date_value = date_match.group(1) if date_match else (datetime.datetime.now() + datetime.timedelta(days=7)).date().isoformat()
        return {
            "couple_names": couple_match.group(1),
            "date": date_value,
            "address": address_match.group(1).strip(),
        }

    def _llm_extract(self, text: str) -> Optional[Dict[str, Any]]:
        if not self.api_key:
            return self._heuristic_extract(text)

        prompt = (
            "Extract wedding event fields from the text. "
            "Return strict JSON with keys: couple_names, date, address. "
            "Use ISO-8601 date if possible. Return null fields if unknown.\n\n"
            f"Text:\n{text}"
        )

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "input": prompt,
            "text": {"format": {"type": "json_object"}},
        }

        try:
            response = httpx.post(
                "https://api.openai.com/v1/responses",
                headers=headers,
                json=payload,
                timeout=30.0,
            )
            response.raise_for_status()
            body = response.json()
            output_text = body.get("output_text", "")
            if not output_text:
                return self._heuristic_extract(text)
            parsed = httpx.Response(200, text=output_text).json()
            if not parsed.get("couple_names") or not parsed.get("address"):
                return self._heuristic_extract(text)
            return {
                "couple_names": str(parsed.get("couple_names", "")).strip(),
                "date": str(parsed.get("date", "")).strip(),
                "address": str(parsed.get("address", "")).strip(),
            }
        except (httpx.HTTPError, ValueError):
            return self._heuristic_extract(text)

    def extract(self, url: str) -> Optional[Dict[str, Any]]:
        text = self._fetch_text(url)
        if not text:
            return None
        return self._llm_extract(text)


class GeolocationAgent:
    """Geocodes addresses through OpenStreetMap Nominatim and computes haversine distance."""

    @staticmethod
    def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        radius = 6371.0
        d_lat = math.radians(lat2 - lat1)
        d_lon = math.radians(lon2 - lon1)
        a = (
            math.sin(d_lat / 2) ** 2
            + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon / 2) ** 2
        )
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return radius * c

    def geocode(self, address: str, user_lat: float, user_lng: float) -> Optional[Dict[str, Any]]:
        if not address:
            return None

        headers = {"User-Agent": "argos-wedding-discovery/1.0"}
        params = {"q": address, "format": "json", "limit": 1}

        try:
            response = httpx.get(
                "https://nominatim.openstreetmap.org/search",
                params=params,
                headers=headers,
                timeout=15.0,
            )
            response.raise_for_status()
            results = response.json()
        except (httpx.HTTPError, ValueError):
            return None

        if not results:
            return None

        lat = float(results[0]["lat"])
        lng = float(results[0]["lon"])
        distance = self._haversine_km(user_lat, user_lng, lat, lng)

        return {"lat": lat, "lng": lng, "distance": distance}


class ValidationAgent:
    def validate(self, events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        seen = set()
        valid_events = []
        for event in events:
            signature = (event.get("couple_names", "").lower(), event.get("address", "").lower())
            if signature in seen:
                continue
            seen.add(signature)
            event["confidence_score"] = 1.0 if event.get("source_url") else 0.7
            event["id"] = str(uuid.uuid4())
            valid_events.append(event)
        return valid_events


class RankingAgent:
    def rank(self, events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return sorted(events, key=lambda x: x.get("distance", float("inf")))
