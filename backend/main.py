from fastapi import Body
# Add hazard point (POST)
@app.post("/hazards")
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

# Remove hazard point (DELETE)
@app.delete("/hazards/{hazard_id}")
def delete_hazard(hazard_id: str):
    with open("sample_hazards.geojson", "r") as f:
        geojson = json.load(f)
    before = len(geojson['features'])
    geojson['features'] = [f for f in geojson['features'] if f['properties']['id'] != hazard_id]
    after = len(geojson['features'])
    with open("sample_hazards.geojson", "w") as f:
        json.dump(geojson, f, indent=2)
    return {"status": "deleted", "removed": before - after}
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from typing import Optional
import uuid
import os
import datetime
import json
import sys
sys.path.append('../routing')
import engine

app = FastAPI()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/submit_photo")
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

@app.get("/hazards")
def get_hazards():
    # Return sample GeoJSON hazard points from file
    import json
    with open("sample_hazards.geojson", "r") as f:
        geojson = json.load(f)
    return JSONResponse(geojson)

@app.post("/ingest_iot")
def ingest_iot(data: dict):
    # TODO: Process IMU/IoT data, attach to trace
    return JSONResponse({"status": "iot data received"})

@app.get("/health")
def health():
    return {"status": "ok"}

# /route endpoint: computes optimal route and hazard alerts
@app.get("/route")
def route(
    from_node: str = None,
    to_node: str = None,
    from_lat: float = None,
    from_lng: float = None,
    to_lat: float = None,
    to_lng: float = None
):
    # Load graph and hazards
    G, nodes = engine.load_graph()
    with open("sample_hazards.geojson", "r") as f:
        hazards = json.load(f)
    G = engine.apply_hazards(G, nodes, hazards)
    # Dynamic start/end node selection
    def find_nearest_node(lat, lng):
        return min(nodes, key=lambda k: (nodes[k][0] - lat)**2 + (nodes[k][1] - lng)**2)
    start = from_node or (find_nearest_node(from_lat, from_lng) if from_lat and from_lng else "A")
    end = to_node or (find_nearest_node(to_lat, to_lng) if to_lat and to_lng else "H")
    try:
        path = engine.compute_route(G, start, end)
    except Exception as e:
        return JSONResponse({"error": "No route found", "details": str(e)}, status_code=400)
    # Route metadata
    route_points = []
    for n in path:
        point = {"node": n, "lat": nodes[n][0], "lng": nodes[n][1]}
        # Check for nearby hazards
        nearby = []
        for feature in hazards.get('features', []):
            coords = feature['geometry']['coordinates']
            if abs(nodes[n][0] - coords[1]) < 0.00005 and abs(nodes[n][1] - coords[0]) < 0.00005:
                meta = feature['properties'].copy()
                meta['recommended_action'] = "avoid" if meta['severity'] > 0.7 else "caution"
                nearby.append(meta)
        point["hazards"] = nearby
        route_points.append(point)
    # Route as GeoJSON LineString
    linestring = {
        "type": "LineString",
        "coordinates": [[p["lng"], p["lat"]] for p in route_points]
    }
    # Hazard alerts
    route_hazards = engine.get_route_hazards(path, nodes, hazards)
    return JSONResponse({
        "route": route_points,
        "route_geojson": linestring,
        "hazard_alerts": route_hazards
    })
