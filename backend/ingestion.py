import os
import uuid
from ai_stub import classify_hazard
from io_utils import save_image
from datetime import datetime
import json

async def process_submission(upload_file, lat, lon, device_id):
    # Step 1: Save image locally
    file_path = save_image(upload_file)

    # Step 2: Get AI hazard classification
    label, confidence = classify_hazard(file_path)

    # Step 3: Prepare hazard object
    hazard = {
        "id": str(uuid.uuid4()),
        "type": label,
        "confidence": confidence,
        "timestamp": datetime.utcnow().isoformat(),
        "device_id_hash": hash(device_id),
        "geometry": {
            "type": "Point",
            "coordinates": [lon, lat]
        },
        "properties": {
            "image_path": file_path,
            "severity": estimate_severity(label, confidence),
        }
    }

    return hazard

def estimate_severity(label, confidence):
    """Simple rules for MVP."""
    if confidence < 0.5:
        return "low"
    if label in ["curb", "stairs"]:
        return "high"
    return "medium"

def get_all_hazards():
    """Read from hazard_data.geojson"""
    with open("data/hazard_data.geojson", "r") as f:
        return json.load(f)
