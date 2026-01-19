from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

OCR_URL = "https://api.ocr.space/parse/image"
OCR_API_KEY = "K88491386388957"  

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    bytes_data = await file.read()

    response = requests.post(
        OCR_URL,
        files={"file": (file.filename, bytes_data)},
        data={
            "apikey": OCR_API_KEY,
            "language": "eng",
            "scale": "true",
            "isTable": "true"
        }
    )

    data = response.json()

    if data.get("IsErroredOnProcessing"):
        return {"status": "error", "message": data.get("ErrorMessage")}

    text = data["ParsedResults"][0]["ParsedText"]

    # for structure sake (basic categorization)
    structured = {
        "title": text.split("\n")[0] if text else "",
        "text": text,
        "lines": text.split("\n")
    }

    return {"status": "success", "structured": structured}
