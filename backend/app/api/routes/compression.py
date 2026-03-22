from fastapi import APIRouter, HTTPException

from app.services.document_service import get_document
from app.services.scaledown_service import compress_text
from app.schemas.document_schema import CompressRequest

router = APIRouter()


@router.post("/compress")
def compress_document(req: CompressRequest):

    doc = get_document(req.document_id)

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    text = doc["text"]

    result = compress_text(text)

    return {
        "original_tokens": result["original_tokens"],
        "compressed_tokens": result["compressed_tokens"],
        "saved_tokens": result["original_tokens"] - result["compressed_tokens"],
        "compressed_text": result["compressed_text"]
    }