from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import pytesseract
import io

app = FastAPI()

# CORS (so Netlify can talk to Render)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def categorize(text):
    text = text.lower()
    if any(x in text for x in ["$", "rs", "₹", "price", ".00"]):
        return "price"
    if any(x in text for x in ["login", "signup", "ok", "submit", "continue"]):
        return "button"
    if len(text.split()) <= 2:
        return "label"
    return "text"

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    img_bytes = await file.read()
    img = Image.open(io.BytesIO(img_bytes))

    raw_text = pytesseract.image_to_string(img, lang="eng")

    lines = [line.strip() for line in raw_text.split("\n") if line.strip()]

    blocks = []
    for line in lines:
        cat = categorize(line)
        blocks.append({
            "text": line,
            "category": cat
        })

    structured = {
        "title": lines[0] if lines else "",
        "labels": [b for b in blocks if b["category"] == "label"],
        "prices": [b for b in blocks if b["category"] == "price"],
        "buttons": [b for b in blocks if b["category"] == "button"],
        "raw": blocks
    }

    return {"status": "success", "structured": structured}

@app.get("/health")
def health():
    return {"status": "ok"}
