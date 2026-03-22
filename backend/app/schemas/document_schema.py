from pydantic import BaseModel

class DocumentRequest(BaseModel):
    document_id: str

class AskRequest(BaseModel):
    document_id: str
    question: str

class CompressRequest(BaseModel):
    document_id: str