# ARGOS 💍

ARGOS is a production-ready web application designed to help users discover nearby wedding events by scanning and analyzing publicly available digital wedding invitations using a cutting-edge **AI Agent Swarm Architecture**.

## 🎯 Features

- **Automated Discovery**: Identifies digital wedding invitations nearby based on your location.
- **Agent Swarm Architecture**: Multi-agent system ensuring high-accuracy data extraction and validation.
- **Smart Geolocation**: Built-in distance calculation and coordinate mapping.
- **Modern UI**: Clean and intuitive map-based interface to view local wedding events.

## 🧩 Architecture

ARGOS employs a Multi-Agent System (AI Agent Swarm) to handle complex extraction logic:
- **Orchestrator Agent**: Manages the end-to-end event discovery pipeline.
- **Discovery Agent**: Crawls digital platforms for wedding invitations.
- **Extraction Agent**: Parses unstructured text using mock LLM capabilities to extract couple names, dates, and locations.
- **Geolocation Agent**: Converts unstructured addresses into geographic coordinates and computes distances relative to the user.
- **Validation Agent**: Deduplicates and scores confidence.
- **Ranking Agent**: Ranks events sequentially based on distance.

## 🛠 Tech Stack

- **Frontend**: Next.js (App Router), React, Tailwind CSS, Leaflet/React-Leaflet.
- **Backend**: FastAPI (Python), SQLAlchemy, GeoAlchemy2, PostGIS.
- **Task Queue**: Redis + Celery (Ready for future scalability).
- **Deployment**: Docker and Docker Compose.

## 🚀 Setup & Execution

### Prerequisites

- Docker and Docker Compose.
- Node.js (v18+) for local UI development (optional).
- Python 3.12+ for local API development (optional).

### Running with Docker (Recommended)

Start the entire stack (Frontend, Backend API, PostGIS Database, Redis) using Docker Compose:

```bash
cd argos
docker compose up --build
```

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

### Local Development Setup

1. **Frontend**:
    ```bash
    cd argos/frontend
    npm install
    npm run dev &
    ```

2. **Backend**:
    ```bash
    cd argos/backend
    pip install -r requirements.txt
    uvicorn main:app --reload &
    ```

## 🧪 Testing

The backend tests include unit testing for individual sub-agents and integration testing for the API endpoints.

To run the test suite:
```bash
export PYTHONPATH=$(pwd)/argos/backend
python -m pytest argos/backend/tests/
```

## 📝 Recent Fixes

Resolved multiple frontend issues to ensure proper compilation and optimal rendering:
- Fixed a TypeScript error in `page.tsx` by passing the required `onPinLocation` prop to the `Map` component.
- Removed unused `pinnedLocation` and `onLocationChange` props from the `Filter` component to address lint warnings.
- Fixed a React cascading render warning in `Map.tsx` by removing redundant `mounted` state, as the map is dynamically loaded without Server-Side Rendering (SSR).

## 🔐 Privacy & Ethics

ARGOS exclusively sources information from publicly available invitations and strictly adheres to respect terms of service, robots.txt, and privacy boundaries. No private or authenticated user data is scraped or retained without direct permission.
