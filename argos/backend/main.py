from typing import List, Optional

from fastapi import BackgroundTasks, FastAPI, HTTPException, Query
from pydantic import BaseModel

from argos.backend.orchestrator import Orchestrator

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="ARGOS Wedding Discovery API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEFAULT_SOURCES = [
    "https://www.weddingwire.com/",
    "https://www.theknot.com/",
]


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
    lat: float = Query(..., description="Pinned latitude"),
    lng: float = Query(..., description="Pinned longitude"),
    radius: float = Query(10.0, description="Search radius in kilometers"),
    sources: List[str] | None = Query(default=None, description="Source pages/domains to scan"),
    model: str | None = Query(default=None, description="LLM model for extraction"),
):
    orchestrator = Orchestrator(llm_model=model)
    discovered_events = orchestrator.run_swarm_workflow(sources or DEFAULT_SOURCES, lat, lng)
    events_in_radius = [event for event in discovered_events if event.get("distance", float("inf")) <= radius]
    return events_in_radius


@app.post("/discover")
async def trigger_discovery(request: DiscoverRequest, background_tasks: BackgroundTasks):
    if not request.urls:
        raise HTTPException(status_code=400, detail="At least one URL is required")

    # Placeholder for async/background workflow integration.
    background_tasks.add_task(lambda: None)
    return {"message": "Discovery workflow started", "urls_queued": len(request.urls)}


@app.post("/extract")
async def extract_info(url: str, model: str | None = None):
    extraction = Orchestrator(llm_model=model).extraction_agent.extract(url)
    if not extraction:
        raise HTTPException(status_code=422, detail="Could not extract wedding information from URL")
    return {"status": "success", **extraction}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
