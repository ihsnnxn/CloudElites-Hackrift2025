import json
import os

DB_PATH = "data/hazard_data.geojson"

def init_storage():
    os.makedirs("data", exist_ok=True)
    if not os.path.exists(DB_PATH):
        with open(DB_PATH, "w") as f:
            f.write(json.dumps({"type": "FeatureCollection", "features": []}))

def save_hazard(hazard_obj):
    with open(DB_PATH, "r") as f:
        data = json.load(f)

    feature = {
        "type": "Feature",
        "geometry": hazard_obj["geometry"],
        "properties": {
            "id": hazard_obj["id"],
            "type": hazard_obj["type"],
            "severity": hazard_obj["properties"]["severity"],
            "confidence": hazard_obj["confidence"],
            "timestamp": hazard_obj["timestamp"]
        }
    }

    data["features"].append(feature)

    with open(DB_PATH, "w") as f:
        json.dump(data, f, indent=2)
