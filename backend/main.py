from fastapi import FastAPI
from dotenv import load_dotenv
import os

from pathlib import Path
# Load env from .env file in the same directory as this file
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)
print(f"DEBUG: Main loaded. GEMINI_API_KEY present: {bool(os.environ.get('GEMINI_API_KEY'))}")

from fastapi.middleware.cors import CORSMiddleware
from .database import create_db_and_tables
from .api import routes

app = FastAPI(title="TeenCare API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    import logging
    logger = logging.getLogger("uvicorn")
    key_present = bool(os.environ.get("GEMINI_API_KEY"))
    logger.info(f"STARTUP CHECK: GEMINI_API_KEY present: {key_present}")
    if key_present:
        logger.info(f"STARTUP CHECK: Key length: {len(os.environ.get('GEMINI_API_KEY') or '')}")

app.include_router(routes.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to TeenCare API"}
