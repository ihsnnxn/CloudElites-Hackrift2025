from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from ingestion import process_submission, get_all_hazards
from db import init_storage, save_hazard
import uvicorn

app = FastAPI(title="AccessNowSG Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_headers=["*"],
    allow_methods=["*"],
)

# Initialize hazard DB on boot
init_storage()

@app.post("/upload")
async def upload_hazard(
    file: UploadFile = File(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    device_id: str = Form(...),
):
    """Receive image + GPS → AI → hazard object."""
    hazard = await process_submission(file, latitude, longitude, device_id)
    save_hazard(hazard)
    return {"status": "ok", "hazard": hazard}

@app.get("/hazards")
def hazards():
    """Return all known hazard points as GeoJSON."""
    return get_all_hazards()

@app.get("/route")
def route_stub():
    """Stub — Dev C plugs real routing logic."""
    return {"message": "Routing engine coming soon"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
