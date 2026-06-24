from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.api.auth import router as auth_router
from app.api.health import router as health_router
from app.api.ai import router as ai_router
from app.api.profile import router as profile_router
from app.core.db import init_db

ROOT = Path(__file__).resolve().parents[2]
FRONTEND = ROOT / "frontend" / "static"

app = FastAPI(
    title="DynastyLink Local Sovereign Web App",
    description="Self-hosted trust identity onboarding portal for AI Freedom Trust Federation.",
    version="0.2.0",
)

@app.on_event("startup")
def startup():
    init_db()

app.include_router(health_router, prefix="/health", tags=["health"])
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(profile_router, prefix="/profile", tags=["trust-profile"])
app.include_router(ai_router, prefix="/ai", tags=["local-ai"])

app.mount("/static", StaticFiles(directory=FRONTEND), name="static")

@app.get("/")
def index():
    return FileResponse(FRONTEND / "index.html")

@app.get("/{path:path}")
def spa(path: str):
    candidate = FRONTEND / path
    if candidate.is_file():
        return FileResponse(candidate)
    return FileResponse(FRONTEND / "index.html")
