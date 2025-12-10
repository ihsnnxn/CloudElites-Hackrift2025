import os
from dotenv import load_dotenv

load_dotenv()

# Configuration values
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
HAZARD_FILE = os.getenv("HAZARD_FILE", "sample_hazards.geojson")
CORS_ALLOW_ORIGINS = os.getenv("CORS_ALLOW_ORIGINS", "*").split(",")

# Example for other thresholds
PROXIMITY_THRESHOLD = float(os.getenv("PROXIMITY_THRESHOLD", "0.00005"))

