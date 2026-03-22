from fastapi import APIRouter, UploadFile, File
import shutil

from app.utils.file_parser import extract_text
from app.utils.token_counter import count_tokens
from app.services.document_service import save_document

router = APIRouter()
UPLOAD_DIR = "uploads"
@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    path = f"{UPLOAD_DIR}/{file.filename}"
    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    text = extract_text(path)
    tokens = count_tokens(text)
    data = {
        "filename": file.filename,
        "text": text,
        "tokens": tokens
    }
    document_id = save_document(data)
    return {
        "document_id": document_id,
        "tokens": tokens
    }