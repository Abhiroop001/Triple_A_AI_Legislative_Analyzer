from fastapi import APIRouter
from app.api.routes import auth, documents, compression
from app.api.routes.analysis.router import router as analysis_router

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["Auth"])
router.include_router(documents.router, prefix="/documents", tags=["Documents"])
router.include_router(compression.router, prefix="/compression", tags=["Compression"])
router.include_router(analysis_router, prefix="/analysis", tags=["Analysis"])