# DynastyLink — Local Open-Source Web App

DynastyLink is the trust identity onboarding portal for the AI Freedom Trust Federation. It helps individuals, families, veterans, creators, businesses, ministries, cooperatives, and AI projects organize themselves as Federated Trusts within the Federation's 1000-Year Dynasty Trust structure.

Users are not merely members. Each user creates a Federated Trust Profile that becomes a sovereign legacy-bearing node.

## Core Rule
No external API calls are required for the core app.

Allowed:
- Browser to local frontend/backend
- Frontend to backend API calls on the same server
- Backend to local SQLite/PostgreSQL
- Backend to local file storage or MinIO
- Backend to local AI model server if enabled later

Not allowed in core MVP:
- OpenAI API
- Bubble backend/API connector
- Stripe as required dependency
- Google Drive as required dependency
- SaaS identity providers as required dependency
- External analytics, telemetry, tracking, or hidden vendor calls

## Implemented MVP Features
- Landing Page
- Sign Up/Login
- Trust Identity Builder
- Covenant Builder
- Asset Map
- Beneficiary Map
- Stewardship Roles
- Local Trust Vault uploads
- Dashboard with completion percentage and statuses
- Printable Federated Trust Identity Packet
- Legal/professional disclaimer
- Sovereign dark navy, white, gold, and electric blue design

## Local Stack
- Frontend: static HTML/CSS/JS served locally by FastAPI
- Backend: FastAPI
- Database: SQLite local MVP
- Vault Storage: local filesystem under `data/uploads/`
- Optional future infra: PostgreSQL, MinIO, Ollama, Qdrant/pgvector

## Run Locally
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Open:

```text
http://127.0.0.1:8000
```

## Trust Paths
- Personal Legacy Trust
- Family Branch Trust
- Veteran Trust
- Creator/IP Trust
- Business Trust
- AI Agent Trust
- Humanitarian Trust
- Cooperative Trust
- Ministry Trust

## Disclaimer
DynastyLink organizes information and prepares educational identity materials. It is not legal, tax, financial, investment, or insurance advice. Trust documents and legal steps require qualified professional review.
