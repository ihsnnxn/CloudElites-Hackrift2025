import os
import uuid

UPLOAD_FOLDER = "uploads"

def save_image(file):
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    fname = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_FOLDER, fname)

    with open(file_path, "wb") as f:
        f.write(file.file.read())

    return file_path
