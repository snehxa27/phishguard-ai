# main.py — PhishGuard AI Entry Point

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.scan import router as scan_router
from routes.history import router as history_router

app = FastAPI(
    title="PhishGuard AI",
    description="Cybersecurity AI tool for phishing detection",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scan_router, tags=["Scan"])
app.include_router(history_router, tags=["History"])


@app.get("/")
def root():
    return {"message": "PhishGuard AI is running", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "ok"}
