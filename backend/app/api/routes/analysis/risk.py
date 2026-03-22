from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool
from app.services.document_service import get_document
from app.services.groq_service import risk_score
from app.schemas.document_schema import DocumentRequest

router = APIRouter()


async def fetch_text(doc_id: str):
    doc = get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc["text"]


@router.post("/risk")
async def risk(req: DocumentRequest):
    text = await fetch_text(req.document_id)
    text = text[:3000]
    result = await run_in_threadpool(risk_score, text)
    return {
    "status": "success",
    "data": result,
    "error": None
}