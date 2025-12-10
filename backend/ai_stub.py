import random

# Placeholder labels
HAZARD_TYPES = [
    "curb_drop", "broken_path", "obstacle", "steep_slope", "smooth_path"
]

def classify_hazard(image_path):
    # Simulated AI output
    label = random.choice(HAZARD_TYPES)
    confidence = round(random.uniform(0.4, 0.95), 2)
    return label, confidence
