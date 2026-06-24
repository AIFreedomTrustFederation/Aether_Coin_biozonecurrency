from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

from app.api.auth import get_current_user
from app.core.db import UPLOAD_DIR, db, row_to_dict, rows_to_dicts

router = APIRouter()

TRUST_PATHS = [
    "Personal Legacy Trust", "Family Branch Trust", "Veteran Trust", "Creator/IP Trust",
    "Business Trust", "AI Agent Trust", "Humanitarian Trust", "Cooperative Trust", "Ministry Trust"
]

ASSET_CATEGORIES = [
    "Family Legacy", "Children", "Intellectual Property", "Business Ideas", "AI Agents",
    "Crypto/Digital Assets", "Insurance Policies/IULs", "Real Estate", "Vehicles",
    "Tools", "Equipment", "Legal Documents", "Creative Works", "Ministries", "Community Projects"
]

BENEFICIARY_CATEGORIES = ["Children", "Descendants", "Family", "Charitable Causes", "Projects", "Future Generations"]
ROLE_TYPES = ["Founder", "Trustee", "Protector", "Beneficiary", "Council Member", "Advisor", "AI Agent", "Successor Steward"]
DOC_TYPES = ["Document", "Photo", "ID", "Business Record", "Policy", "Contract", "Evidence", "Legacy File"]


def now():
    return datetime.now(timezone.utc).isoformat()


def get_profile_id(con, user_id: str) -> str:
    row = con.execute("SELECT id FROM trust_profiles WHERE user_id=?", (user_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Trust profile not found")
    return row["id"]


class ProfileUpdate(BaseModel):
    trust_name: str = ""
    trust_type: str = ""
    federation_status: str = "Draft"
    legal_status: str = "Preparation Needed"


class CovenantUpdate(BaseModel):
    protect_answer: str = ""
    serve_answer: str = ""
    principles_answer: str = ""
    stewarding_answer: str = ""
    never_violate_answer: str = ""
    legacy_answer: str = ""


class AssetCreate(BaseModel):
    category: str
    name: str
    description: str = ""
    status: str = "Mapped"


class BeneficiaryCreate(BaseModel):
    category: str
    name: str
    relationship: str = ""
    purpose: str = ""


class RoleCreate(BaseModel):
    role: str
    name: str
    duties: str = ""


def build_covenant(profile: dict) -> tuple[str, str, str]:
    trust_name = profile.get("trust_name") or "This Federated Trust"
    trust_type = profile.get("trust_type") or "Federated Trust"
    protect = profile.get("protect_answer") or "the sacred legacy, dignity, records, gifts, and lawful interests entrusted to it"
    serve = profile.get("serve_answer") or "its beneficiaries, future generations, and the mission of responsible stewardship"
    principles = profile.get("principles_answer") or "truth, sovereignty, accountability, compassion, lawful order, transparency, and long-horizon service"
    stewarding = profile.get("stewarding_answer") or "family legacy, creative works, resources, relationships, records, and mission-bearing assets"
    never = profile.get("never_violate_answer") or "human dignity, beneficiary welfare, lawful process, privacy, informed consent, and the trust purpose"
    legacy = profile.get("legacy_answer") or "a living inheritance of wisdom, freedom, stewardship, and service for 100, 500, and 1,000 years"

    mission = f"{trust_name} exists as a {trust_type} to protect {protect} and to serve {serve}."
    purpose = f"Its purpose is to steward {stewarding} under the governing principles of {principles}."
    covenant = (
        f"We establish {trust_name} as a sovereign legacy-bearing node within the AI Freedom Trust Federation. "
        f"This trust protects {protect}. It serves {serve}. It is governed by {principles}. "
        f"It stewards {stewarding}. It must never violate {never}. "
        f"Its legacy shall remain alive as {legacy}. "
        "This covenant is a declaration of intent, stewardship, and identity, prepared for educational and organizational purposes pending qualified professional review."
    )
    return mission, purpose, covenant


def completion(profile, assets, beneficiaries, roles, files):
    checks = [
        bool(profile.get("trust_name")), bool(profile.get("trust_type")),
        bool(profile.get("protect_answer")), bool(profile.get("serve_answer")),
        bool(profile.get("principles_answer")), bool(profile.get("stewarding_answer")),
        bool(profile.get("never_violate_answer")), bool(profile.get("legacy_answer")),
        len(assets) > 0, len(beneficiaries) > 0, len(roles) > 0, len(files) > 0,
    ]
    return round(sum(checks) / len(checks) * 100)


@router.get("/options")
def options():
    return {"trust_paths": TRUST_PATHS, "asset_categories": ASSET_CATEGORIES, "beneficiary_categories": BENEFICIARY_CATEGORIES, "role_types": ROLE_TYPES, "doc_types": DOC_TYPES}


@router.get("")
def get_profile(user=Depends(get_current_user)):
    with db() as con:
        pid = get_profile_id(con, user["id"])
        profile = row_to_dict(con.execute("SELECT * FROM trust_profiles WHERE id=?", (pid,)).fetchone())
        assets = rows_to_dicts(con.execute("SELECT * FROM assets WHERE trust_profile_id=? ORDER BY created_at DESC", (pid,)).fetchall())
        beneficiaries = rows_to_dicts(con.execute("SELECT * FROM beneficiaries WHERE trust_profile_id=? ORDER BY created_at DESC", (pid,)).fetchall())
        roles = rows_to_dicts(con.execute("SELECT * FROM stewardship_roles WHERE trust_profile_id=? ORDER BY created_at DESC", (pid,)).fetchall())
        files = rows_to_dicts(con.execute("SELECT * FROM vault_files WHERE trust_profile_id=? ORDER BY uploaded_at DESC", (pid,)).fetchall())
    pct = completion(profile, assets, beneficiaries, roles, files)
    return {"profile": profile, "assets": assets, "beneficiaries": beneficiaries, "roles": roles, "files": files, "completion": pct}


@router.put("")
def update_profile(payload: ProfileUpdate, user=Depends(get_current_user)):
    if payload.trust_type and payload.trust_type not in TRUST_PATHS:
        raise HTTPException(status_code=400, detail="Unknown trust path")
    with db() as con:
        pid = get_profile_id(con, user["id"])
        con.execute("UPDATE trust_profiles SET trust_name=?, trust_type=?, federation_status=?, legal_status=?, updated_at=? WHERE id=?", (payload.trust_name, payload.trust_type, payload.federation_status, payload.legal_status, now(), pid))
    return {"ok": True}


@router.put("/covenant")
def update_covenant(payload: CovenantUpdate, user=Depends(get_current_user)):
    with db() as con:
        pid = get_profile_id(con, user["id"])
        con.execute("UPDATE trust_profiles SET protect_answer=?, serve_answer=?, principles_answer=?, stewarding_answer=?, never_violate_answer=?, legacy_answer=?, covenant_status=?, updated_at=? WHERE id=?", (payload.protect_answer, payload.serve_answer, payload.principles_answer, payload.stewarding_answer, payload.never_violate_answer, payload.legacy_answer, "Drafted", now(), pid))
        profile = row_to_dict(con.execute("SELECT * FROM trust_profiles WHERE id=?", (pid,)).fetchone())
        mission, purpose, covenant = build_covenant(profile)
        con.execute("UPDATE trust_profiles SET mission=?, purpose=?, covenant=?, updated_at=? WHERE id=?", (mission, purpose, covenant, now(), pid))
    return {"ok": True, "mission": mission, "purpose": purpose, "covenant": covenant}


@router.post("/assets")
def add_asset(payload: AssetCreate, user=Depends(get_current_user)):
    if payload.category not in ASSET_CATEGORIES:
        raise HTTPException(status_code=400, detail="Unknown asset category")
    item_id = str(uuid4())
    with db() as con:
        pid = get_profile_id(con, user["id"])
        con.execute("INSERT INTO assets (id,trust_profile_id,category,name,description,status,created_at) VALUES (?,?,?,?,?,?,?)", (item_id, pid, payload.category, payload.name, payload.description, payload.status, now()))
    return {"ok": True, "id": item_id}


@router.post("/beneficiaries")
def add_beneficiary(payload: BeneficiaryCreate, user=Depends(get_current_user)):
    if payload.category not in BENEFICIARY_CATEGORIES:
        raise HTTPException(status_code=400, detail="Unknown beneficiary category")
    item_id = str(uuid4())
    with db() as con:
        pid = get_profile_id(con, user["id"])
        con.execute("INSERT INTO beneficiaries (id,trust_profile_id,category,name,relationship,purpose,created_at) VALUES (?,?,?,?,?,?,?)", (item_id, pid, payload.category, payload.name, payload.relationship, payload.purpose, now()))
    return {"ok": True, "id": item_id}


@router.post("/roles")
def add_role(payload: RoleCreate, user=Depends(get_current_user)):
    if payload.role not in ROLE_TYPES:
        raise HTTPException(status_code=400, detail="Unknown stewardship role")
    item_id = str(uuid4())
    with db() as con:
        pid = get_profile_id(con, user["id"])
        con.execute("INSERT INTO stewardship_roles (id,trust_profile_id,role,name,duties,created_at) VALUES (?,?,?,?,?,?)", (item_id, pid, payload.role, payload.name, payload.duties, now()))
    return {"ok": True, "id": item_id}


@router.post("/vault")
async def upload_file(doc_type: str = Form(...), notes: str = Form(""), file: UploadFile = File(...), user=Depends(get_current_user)):
    if doc_type not in DOC_TYPES:
        raise HTTPException(status_code=400, detail="Unknown document type")
    item_id = str(uuid4())
    safe_name = file.filename.replace("/", "_").replace("\\", "_") if file.filename else "upload.bin"
    stored_name = f"{item_id}_{safe_name}"
    data = await file.read()
    if len(data) > 50 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large for local MVP limit")
    (UPLOAD_DIR / stored_name).write_bytes(data)
    with db() as con:
        pid = get_profile_id(con, user["id"])
        con.execute("INSERT INTO vault_files (id,trust_profile_id,doc_type,original_filename,stored_filename,notes,uploaded_at) VALUES (?,?,?,?,?,?,?)", (item_id, pid, doc_type, safe_name, stored_name, notes, now()))
    return {"ok": True, "id": item_id, "filename": safe_name}


@router.get("/packet")
def packet(user=Depends(get_current_user)):
    return get_profile(user)
