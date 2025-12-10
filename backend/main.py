
from fastapi import FastAPI, UploadFile, File, Form, Body
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

import uuid
import os
import logging
import json
import aiofiles
import datetime
from routing import engine
from routing import features
from config import UPLOAD_DIR, HAZARD_FILE, CORS_ALLOW_ORIGINS, PROXIMITY_THRESHOLD

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger(__name__)

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
    allow_origins=CORS_ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class HazardRequest(BaseModel):
    lng: float = Field(..., json_schema_extra={"example": 103.851959})
    lat: float = Field(..., json_schema_extra={"example": 1.290270})
    hazard_type: str = Field(..., json_schema_extra={"example": "curb"})
    severity: float = Field(..., json_schema_extra={"example": 0.5})
    confidence: float = Field(..., json_schema_extra={"example": 0.9})
    last_seen: Optional[str] = Field(None, json_schema_extra={"example": "2025-12-10T12:00:00Z"})
    hazard_id: Optional[str] = Field(None, json_schema_extra={"example": "hazard123"})

class HazardFeature(BaseModel):
    type: str
    geometry: Dict[str, Any]
    properties: Dict[str, Any]

class HazardResponse(BaseModel):
    status: str
    feature: HazardFeature

@app.post(
    "/hazards",
    tags=["Hazard"],
    summary="Add hazard point",
    response_model=HazardResponse,
    description="Add a new hazard point to the system. Use this to report obstacles, curbs, or other hazards detected in the environment.",
    response_description="Status and the added hazard feature."
)
async def add_hazard(req: HazardRequest):
    logger.info(f"Received add_hazard request: {req}")
    try:
        async with aiofiles.open("sample_hazards.geojson", "r") as f:
                geojson = json.loads(await f.read())
    except Exception as e:
        logger.error(f"Error reading hazards file: {e}")
        return JSONResponse({"error": "Failed to read hazards file", "details": str(e)}, status_code=500)
    new_id = req.hazard_id or f"hazard{len(geojson['features'])+1}"
    feature = {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [req.lng, req.lat]},
        "properties": {
            "id": new_id,
            "type": req.hazard_type,
            "severity": req.severity,
            "confidence": req.confidence,
            "last_seen": req.last_seen or datetime.datetime.now(datetime.UTC).isoformat()
        }
    }
    geojson['features'].append(feature)
    try:
        async with aiofiles.open("sample_hazards.geojson", "w") as f:
                await f.write(json.dumps(geojson, indent=2))
    except Exception as e:
        logger.error(f"Error writing hazards file: {e}")
        return JSONResponse({"error": "Failed to write hazards file", "details": str(e)}, status_code=500)
    return {"status": "added", "feature": feature}

@app.delete(
    "/hazards/{hazard_id}",
    tags=["Hazard"],
    summary="Remove hazard point",
    description="Delete a hazard point by its unique ID.",
    response_description="Status and number of hazards removed."
)
async def delete_hazard(hazard_id: str):
    logger.info(f"Received delete_hazard request: {hazard_id}")
    try:
        async with aiofiles.open("sample_hazards.geojson", "r") as f:
                geojson = json.loads(await f.read())
    except Exception as e:
        logger.error(f"Error reading hazards file: {e}")
        return JSONResponse({"error": "Failed to read hazards file", "details": str(e)}, status_code=500)
    before = len(geojson['features'])
    geojson['features'] = [f for f in geojson['features'] if f['properties']['id'] != hazard_id]
    after = len(geojson['features'])
    try:
        async with aiofiles.open("sample_hazards.geojson", "w") as f:
                await f.write(json.dumps(geojson, indent=2))
    except Exception as e:
        logger.error(f"Error writing hazards file: {e}")
        return JSONResponse({"error": "Failed to write hazards file", "details": str(e)}, status_code=500)
    return {"status": "deleted", "removed": before - after}

@app.post(
    "/submit_photo",
    tags=["Photo"],
    summary="Upload photo and GPS for hazard detection",
    description="Upload a photo and GPS metadata for hazard detection. Only JPEG and PNG files are accepted.",
    response_description="Status and metadata of the uploaded photo."
)
async def submit_photo(
    # ...existing code...
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
    try:
        with open(file_path, "wb") as f:
            f.write(await photo.read())
        logger.info(f"Photo saved: {file_path}")
    except Exception as e:
        logger.error(f"Error saving photo: {e}")
        return JSONResponse({"error": "Failed to save photo", "details": str(e)}, status_code=500)
    # Normalize metadata
    meta = {
        "photo_id": photo_id,
        "filename": photo.filename,
        "gps_lat": gps_lat,
        "gps_lng": gps_lng,
        "gps_accuracy": gps_accuracy,
        "device_heading": device_heading,
        "timestamp": timestamp or datetime.datetime.now(datetime.UTC).isoformat()
    }
    # TODO: Run AI classifier, produce hazard GeoJSON
    # For now, return stub
    return JSONResponse({"status": "received", "meta": meta})

@app.get(
    "/hazards",
    tags=["Hazard"],
    summary="Get all hazard points",
    description="Retrieve all hazard points as GeoJSON features.",
    response_description="GeoJSON containing all hazard features."
)
async def get_hazards():
    logger.info("Received get_hazards request")
    # Return sample GeoJSON hazard points from file
    try:
        async with aiofiles.open("sample_hazards.geojson", "r") as f:
                geojson = json.loads(await f.read())
    except Exception as e:
        logger.error(f"Error reading hazards file: {e}")
        return JSONResponse({"error": "Failed to read hazards file", "details": str(e)}, status_code=500)
    return JSONResponse(geojson)

@app.post(
    "/ingest_iot",
    tags=["IoT"],
    summary="Ingest IoT/IMU data",
    description="Ingest IoT or IMU sensor data for trace analysis.",
    response_description="Status of IoT data ingestion."
)
def ingest_iot(data: dict):
    # TODO: Process IMU/IoT data, attach to trace
    return JSONResponse({"status": "iot data received"})

@app.get(
    "/health",
    tags=["Health"],
    summary="API health check",
    description="Check the health status of the API.",
    response_description="Status of the API."
)
def health():
    return {"status": "ok"}


# /route endpoint: computes optimal route and hazard alerts, now supports external data sources
class RouteRequest(BaseModel):
    from_node: Optional[str] = Field(None, json_schema_extra={"example": "A"})
    to_node: Optional[str] = Field(None, json_schema_extra={"example": "H"})
    from_lat: Optional[float] = Field(None, json_schema_extra={"example": 1.290270})
    from_lng: Optional[float] = Field(None, json_schema_extra={"example": 103.851959})
    to_lat: Optional[float] = Field(None, json_schema_extra={"example": 1.290600})
    to_lng: Optional[float] = Field(None, json_schema_extra={"example": 103.852300})
    profile: str = Field("safest", json_schema_extra={"example": "safest"})
    external_data: Optional[Dict[str, Any]] = Field(None, json_schema_extra={"example": {"crowd_density": {"B": 2}, "weather": {"rain": True}}})

class RoutePoint(BaseModel):
    node: str
    lat: float
    lng: float
    hazards: List[Dict[str, Any]] = []

class RouteGeoJSON(BaseModel):
    type: str
    coordinates: List[List[float]]

class RouteResponse(BaseModel):
    route: List[RoutePoint]
    route_geojson: RouteGeoJSON
    hazard_alerts: List[Dict[str, Any]]

@app.post(
    "/route",
    tags=["Routing"],
    summary="Compute accessible route with hazard and external data integration",
    response_model=RouteResponse,
    description="Compute the optimal accessible route, integrating hazards and optional external data (crowd, weather, etc.).",
    response_description="Route details, geojson, and hazard alerts."
)
def route(req: RouteRequest):
    logger.info(f"Received route request: {req}")
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
    try:
        G, nodes = engine.load_graph()
    except Exception as e:
        logger.error(f"Error loading graph: {e}")
        return JSONResponse({"error": "Failed to load graph", "details": str(e)}, status_code=500)
    try:
           with open(HAZARD_FILE, "r") as f:
            hazards = json.load(f)
    except Exception as e:
        logger.error(f"Error reading hazards file: {e}")
        return JSONResponse({"error": "Failed to read hazards file", "details": str(e)}, status_code=500)
    try:
        G = engine.apply_hazards(G, nodes, hazards)
    except Exception as e:
        logger.error(f"Error applying hazards: {e}")
        return JSONResponse({"error": "Failed to apply hazards", "details": str(e)}, status_code=500)
    def find_nearest_node(lat, lng):
        return min(nodes, key=lambda k: (nodes[k][0] - lat)**2 + (nodes[k][1] - lng)**2)
    start = req.from_node or (find_nearest_node(req.from_lat, req.from_lng) if req.from_lat and req.from_lng else "A")
    end = req.to_node or (find_nearest_node(req.to_lat, req.to_lng) if req.to_lat and req.to_lng else "H")
    try:
        path = features.get_route_with_external_data(G, nodes, start, end, profile=req.profile, external_data=req.external_data)
    except Exception as e:
        logger.error(f"No route found: {e}")
        return JSONResponse({"error": "No route found", "details": str(e)}, status_code=400)
    route_points = []
    for n in path:
        point = {"node": n, "lat": nodes[n][0], "lng": nodes[n][1]}
        nearby = []
        for feature in hazards.get('features', []):
            coords = feature['geometry']['coordinates']
            if abs(nodes[n][0] - coords[1]) < PROXIMITY_THRESHOLD and abs(nodes[n][1] - coords[0]) < PROXIMITY_THRESHOLD:
                meta = feature['properties'].copy()
                meta['recommended_action'] = "avoid" if meta['severity'] > 0.7 else "caution"
                nearby.append(meta)
        point["hazards"] = nearby
        route_points.append(point)
    linestring = {
        "type": "LineString",
        "coordinates": [[p["lng"], p["lat"]] for p in route_points]
    }
    try:
        route_hazards = engine.get_route_hazards(path, nodes, hazards)
    except Exception as e:
        logger.error(f"Error getting route hazards: {e}")
        return JSONResponse({"error": "Failed to get route hazards", "details": str(e)}, status_code=500)
    return {
        "route": route_points,
        "route_geojson": linestring,
        "hazard_alerts": route_hazards
    }
