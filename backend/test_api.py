import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_get_hazards():
    response = client.get("/hazards")
    assert response.status_code == 200
    assert "features" in response.json()

def test_add_hazard():
    payload = {
        "lng": 103.851959,
        "lat": 1.290270,
        "hazard_type": "curb",
        "severity": 0.5,
        "confidence": 0.9
    }
    response = client.post("/hazards", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "added"

def test_delete_hazard():
    # Add a hazard first
    payload = {
        "lng": 103.851959,
        "lat": 1.290270,
        "hazard_type": "curb",
        "severity": 0.5,
        "confidence": 0.9,
        "hazard_id": "testhazard"
    }
    client.post("/hazards", json=payload)
    # Now delete
    response = client.delete("/hazards/testhazard")
    assert response.status_code == 200
    assert response.json()["status"] == "deleted"

def test_route():
    payload = {
        "from_lat": 1.290270,
        "from_lng": 103.851959,
        "to_lat": 1.290600,
        "to_lng": 103.852300,
        "profile": "safest"
    }
    response = client.post("/route", json=payload)
    assert response.status_code == 200
    assert "route" in response.json()
    assert "route_geojson" in response.json()
    assert "hazard_alerts" in response.json()
