import os
from dotenv import load_dotenv
load_dotenv()
class Settings:
    APP_NAME = "AI Legislative Analyzer"
    VERSION = "1.0.0"
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 8000))
    SECRET_KEY = os.getenv("SECRET_KEY", "Sukanya")
    ALGORITHM = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = 60
    SCALEDOWN_API_KEY = os.getenv("SCALEDOWN_API_KEY")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY")
    FIREBASE_CREDENTIALS = os.getenv("FIREBASE_CREDENTIALS", "firebase_key.json")
    UPLOAD_DIR = "uploads"
    MAX_FILE_SIZE_MB = 50
    MAX_DOCUMENT_TOKENS = 200000
settings = Settings()