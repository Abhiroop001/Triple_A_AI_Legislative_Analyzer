from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import router

app = FastAPI(title="AI Legislative Analyzer",version="1.1")
origins = ["http://localhost:5173","*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router, prefix="/api")
@app.get("/")
def home():
    return {"message": "AI Legislative Analyzer Backend Running"}