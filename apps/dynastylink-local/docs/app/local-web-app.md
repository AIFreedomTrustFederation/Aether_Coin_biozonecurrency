# DynastyLink Local Web App

This folder contains the first local-only DynastyLink web app implementation.

## Features
- Landing page
- Sign up and login
- Trust Identity Builder
- Covenant Builder
- Asset Map
- Beneficiary Map
- Stewardship Roles
- Trust Vault uploads
- Dashboard
- Printable Federated Trust Identity Packet

## Runtime
The app is served by FastAPI and uses local static frontend files. The MVP database is SQLite and is created automatically at runtime.

## No External API Calls
The app does not require external API calls for the core workflow. All browser calls are internal calls to the local backend.

## Run
```bash
cd apps/dynastylink-local/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Open `http://127.0.0.1:8000`.
