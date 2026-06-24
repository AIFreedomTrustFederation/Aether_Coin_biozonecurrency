from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class LocalAIRequest(BaseModel):
    question: str
    trust_profile_id: str | None = None

@router.post("/trust-guide")
def trust_guide(request: LocalAIRequest):
    # Placeholder for local Ollama/llama.cpp RAG pipeline.
    # No external AI API calls are made here.
    return {
        "mode": "local-only",
        "answer": (
            "DynastyLink is configured for local-only AI. "
            "The next implementation step is to connect this endpoint to Ollama or llama.cpp, "
            "retrieve approved AIFT knowledge locally, and answer with legal-safe educational guidance."
        ),
        "disclaimer": "Educational only. Not legal, tax, financial, investment, or insurance advice.",
    }
