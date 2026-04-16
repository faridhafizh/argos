from fastapi import FastAPI, BackgroundTasks, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
import datetime

app = FastAPI(title="ARGOS Wedding Discovery API")

class EventResponse(BaseModel):
    id: str
    couple_names: str
    date: str
    address: str
    lat: float
    lng: float
    source_url: str
    distance: Optional[float] = None

class DiscoverRequest(BaseModel):
    urls: List[str]

@app.get("/events/nearby", response_model=List[EventResponse])
async def get_nearby_events(
    lat: float = Query(..., description="User latitude"),
    lng: float = Query(..., description="User longitude"),
    radius: float = Query(10.0, description="Search radius in kilometers")
):
    # Mock response
    return [
        {
            "id": "1",
            "couple_names": "Romeo & Juliet",
            "date": (datetime.datetime.now() + datetime.timedelta(days=2)).isoformat(),
            "address": "Verona Grand Hotel, Verona Street",
            "lat": lat + 0.01,
            "lng": lng + 0.01,
            "source_url": "https://example.com/invitation1",
            "distance": 1.5
        }
    ]

@app.post("/discover")
async def trigger_discovery(request: DiscoverRequest, background_tasks: BackgroundTasks):
    # Trigger background workflow here
    return {"message": "Discovery workflow started", "urls_queued": len(request.urls)}

@app.post("/extract")
async def extract_info(url: str):
    # Mock extraction response
    return {"status": "success", "couple": "John & Jane", "location": "Central Park"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
