from fastapi import FastAPI, UploadFile, File
import uvicorn
import numpy as np
import easyocr
from PIL import Image
import io
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

ocr = easyocr.Reader(['en'])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def to_python(v):
    if isinstance(v, (np.integer,)):
        return int(v)
    if isinstance(v, (np.floating,)):
        return float(v)
    if isinstance(v, np.ndarray):
        return v.tolist()
    return v

def convert(obj):
    if isinstance(obj, (np.integer,)):
        return int(obj)
    if isinstance(obj, (np.floating,)):
        return float(obj)
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    if isinstance(obj, (list, tuple)):
        return [convert(i) for i in obj]
    if isinstance(obj, dict):
        return {k: convert(v) for k, v in obj.items()}
    return obj


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    image_bytes = await file.read()
    img = Image.open(io.BytesIO(image_bytes))

    result = ocr.readtext(np.array(img))

    blocks = []
    for bbox, text, conf in result:
        blocks.append({
            "bbox": bbox,
            "text": text,
            "confidence": conf,
        })

    structured = {
        "status": "success",
        "title": blocks[0]["text"] if blocks else "",
        "blocks": blocks,
    }

    return convert(structured)

