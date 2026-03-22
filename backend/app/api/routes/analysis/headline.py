from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool
from app.services.document_service import get_document
from app.services.groq_service import headline
from app.schemas.document_schema import DocumentRequest

router = APIRouter()

def fetch_text(doc_id: str):
    doc = get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc["text"]


@router.post("/headline")
async def news(req: DocumentRequest):
    text = fetch_text(req.document_id)
    text = text[:3000]
    result = await run_in_threadpool(headline, text)
    return {
    "status": "success",
    "data": {"headline": result},
    "error": None
}