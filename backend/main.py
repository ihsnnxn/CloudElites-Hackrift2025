
from fastapi import FastAPI, UploadFile, File, Form, Body
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

import uuid
import os
import datetime
import json
import sys
# Ensure routing directory is always correctly added to sys.path
from routing import engine
from routing import features

app = FastAPI(
    title="CloudElites Routing API",
    description="Accessible routing, hazard ingestion, and extensible data integration for hackathon/demo.",
    version="1.0.0",
    openapi_tags=[
        {"name": "Routing", "description": "Accessible route computation and analytics."},
        {"name": "Hazard", "description": "Hazard ingestion and management."},
        {"name": "Photo", "description": "Photo and GPS ingestion for hazard detection."},
        {"name": "IoT", "description": "IoT/IMU data ingestion."},
        {"name": "Health", "description": "API health check."}
    ]
)

# Allow all origins for hackathon/demo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/hazards", tags=["Hazard"], summary="Add hazard point")
def add_hazard(
    lng: float = Body(...),
    lat: float = Body(...),
    hazard_type: str = Body(...),
    severity: float = Body(...),
    confidence: float = Body(...),
    last_seen: str = Body(None),
    hazard_id: str = Body(None)
):
    with open("sample_hazards.geojson", "r") as f:
        geojson = json.load(f)
    new_id = hazard_id or f"hazard{len(geojson['features'])+1}"
    feature = {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [lng, lat]},
        "properties": {
            "id": new_id,
            "type": hazard_type,
            "severity": severity,
            "confidence": confidence,
            "last_seen": last_seen or datetime.datetime.utcnow().isoformat()
        }
    }
    geojson['features'].append(feature)
    with open("sample_hazards.geojson", "w") as f:
        json.dump(geojson, f, indent=2)
    return {"status": "added", "feature": feature}

@app.delete("/hazards/{hazard_id}", tags=["Hazard"], summary="Remove hazard point")
def delete_hazard(hazard_id: str):
    with open("sample_hazards.geojson", "r") as f:
        geojson = json.load(f)
    before = len(geojson['features'])
    geojson['features'] = [f for f in geojson['features'] if f['properties']['id'] != hazard_id]
    after = len(geojson['features'])
    with open("sample_hazards.geojson", "w") as f:
        json.dump(geojson, f, indent=2)
    return {"status": "deleted", "removed": before - after}

@app.post("/submit_photo", tags=["Photo"], summary="Upload photo and GPS for hazard detection")
async def submit_photo(
    photo: UploadFile = File(...),
    gps_lat: float = Form(...),
    gps_lng: float = Form(...),
    gps_accuracy: float = Form(...),
    device_heading: Optional[float] = Form(None),
    timestamp: Optional[str] = Form(None)
):
    # Save photo
    photo_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{photo_id}_{photo.filename}")
    with open(file_path, "wb") as f:
        f.write(await photo.read())
    # Normalize metadata
    meta = {
        "photo_id": photo_id,
        "filename": photo.filename,
        "gps_lat": gps_lat,
        "gps_lng": gps_lng,
        "gps_accuracy": gps_accuracy,
        "device_heading": device_heading,
        "timestamp": timestamp or datetime.datetime.utcnow().isoformat()
    }
    # TODO: Run AI classifier, produce hazard GeoJSON
    # For now, return stub
    return JSONResponse({"status": "received", "meta": meta})

@app.get("/hazards", tags=["Hazard"], summary="Get all hazard points")
def get_hazards():
    # Return sample GeoJSON hazard points from file
    import json
    with open("sample_hazards.geojson", "r") as f:
        geojson = json.load(f)
    return JSONResponse(geojson)

@app.post("/ingest_iot", tags=["IoT"], summary="Ingest IoT/IMU data")
def ingest_iot(data: dict):
    # TODO: Process IMU/IoT data, attach to trace
    return JSONResponse({"status": "iot data received"})

@app.get("/health", tags=["Health"], summary="API health check")
def health():
    return {"status": "ok"}


# /route endpoint: computes optimal route and hazard alerts, now supports external data sources
@app.post("/route", tags=["Routing"], summary="Compute accessible route with hazard and external data integration")
def route(
    from_node: str = Body(None),
    to_node: str = Body(None),
    from_lat: float = Body(None),
    from_lng: float = Body(None),
    to_lat: float = Body(None),
    to_lng: float = Body(None),
    profile: str = Body("safest"),
    external_data: dict = Body(None)
):
    """
    Computes optimal accessible route, integrating hazards and optional external data (crowd, weather, etc.).
    POST JSON body example:
    {
      "from_lat": 1.290270, "from_lng": 103.851959,
      "to_lat": 1.290600, "to_lng": 103.852300,
      "profile": "safest",
      "external_data": {"crowd_density": {"B": 2}, "weather": {"rain": true}}
    }
    """
    G, nodes = engine.load_graph()
    with open("sample_hazards.geojson", "r") as f:
        hazards = json.load(f)
    G = engine.apply_hazards(G, nodes, hazards)
    def find_nearest_node(lat, lng):
        return min(nodes, key=lambda k: (nodes[k][0] - lat)**2 + (nodes[k][1] - lng)**2)
    start = from_node or (find_nearest_node(from_lat, from_lng) if from_lat and from_lng else "A")
    end = to_node or (find_nearest_node(to_lat, to_lng) if to_lat and to_lng else "H")
    try:
        path = features.get_route_with_external_data(G, nodes, start, end, profile=profile, external_data=external_data)
    except Exception as e:
        return JSONResponse({"error": "No route found", "details": str(e)}, status_code=400)
    route_points = []
    for n in path:
        point = {"node": n, "lat": nodes[n][0], "lng": nodes[n][1]}
        nearby = []
        for feature in hazards.get('features', []):
            coords = feature['geometry']['coordinates']
            if abs(nodes[n][0] - coords[1]) < 0.00005 and abs(nodes[n][1] - coords[0]) < 0.00005:
                meta = feature['properties'].copy()
                meta['recommended_action'] = "avoid" if meta['severity'] > 0.7 else "caution"
                nearby.append(meta)
        point["hazards"] = nearby
        route_points.append(point)
    linestring = {
        "type": "LineString",
        "coordinates": [[p["lng"], p["lat"]] for p in route_points]
    }
    route_hazards = engine.get_route_hazards(path, nodes, hazards)
    return JSONResponse({
        "route": route_points,
        "route_geojson": linestring,
        "hazard_alerts": route_hazards
    })
