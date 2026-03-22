from fastapi import APIRouter, HTTPException
from app.services.document_service import get_document
from app.services.groq_service import one_line_summary
from app.schemas.document_schema import DocumentRequest
from fastapi.concurrency import run_in_threadpool

router = APIRouter()

async def fetch_text(doc_id: str):
    doc = get_document(doc_id)

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    return doc["text"]

@router.post("/summary")
async def summary(req: DocumentRequest):
    text = await fetch_text(req.document_id)
    text = text[:3000]
    result = await run_in_threadpool(one_line_summary, text)
    return {
    "status": "success",
    "data": {"summary": result},
    "error": None
}
