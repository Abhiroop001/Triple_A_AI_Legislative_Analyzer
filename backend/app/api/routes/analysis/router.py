from fastapi import APIRouter

from . import summary, keywords, risk, pros_cons, impact, simple, headline, ask

router = APIRouter()

router.include_router(summary.router)
router.include_router(keywords.router)
router.include_router(risk.router)
router.include_router(pros_cons.router)
router.include_router(impact.router)
router.include_router(simple.router)
router.include_router(headline.router)
router.include_router(ask.router)