# AccessNowSG Backend (FastAPI)

## Endpoints
- `/submit_photo` : Upload photo + metadata (GPS, heading, timestamp)
- `/hazards` : Get verified hazard points (GeoJSON)
- `/ingest_iot` : Ingest IoT/IMU sensor data
- `/health` : Health check

## Setup
1. Install dependencies:
   ```sh
   c:/Users/Coffee/Documents/HackRift/CloudElites-Hackrift2025/.venv/Scripts/python.exe -m pip install -r requirements.txt
   ```
2. Run server:
   ```sh
   c:/Users/Coffee/Documents/HackRift/CloudElites-Hackrift2025/.venv/Scripts/python.exe -m uvicorn main:app --reload
   ```

## Demo Data
- `sample_hazards.geojson` : Pre-populated hazard points for routing and UI demo.

---
Next: AI/IoT microservice, routing engine, and UI scaffolding.
