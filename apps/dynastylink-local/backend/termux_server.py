#!/usr/bin/env python3
"""DynastyLink Termux server.

Runs the DynastyLink MVP on Android/Termux with Python standard library only.
No FastAPI, Pydantic, Uvicorn, pip packages, or external APIs required.
"""
from __future__ import annotations

import hashlib
import hmac
import json
import mimetypes
import os
import secrets
import sqlite3
import sys
from datetime import datetime, timezone
from http import cookies
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse
from uuid import uuid4

ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "frontend" / "static"
DATA_DIR = ROOT / "data"
UPLOAD_DIR = DATA_DIR / "uploads"
DB_PATH = DATA_DIR / "dynastylink.sqlite3"
DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

TRUST_PATHS = [
    "Personal Legacy Trust", "Family Branch Trust", "Veteran Trust", "Creator/IP Trust",
    "Business Trust", "AI Agent Trust", "Humanitarian Trust", "Cooperative Trust", "Ministry Trust"
]
ASSET_CATEGORIES = [
    "Family Legacy", "Children", "Intellectual Property", "Business Ideas", "AI Agents",
    "Crypto/Digital Assets", "Insurance Policies/IULs", "Real Estate", "Vehicles", "Tools",
    "Equipment", "Legal Documents", "Creative Works", "Ministries", "Community Projects"
]
BENEFICIARY_CATEGORIES = ["Children", "Descendants", "Family", "Charitable Causes", "Projects", "Future Generations"]
ROLE_TYPES = ["Founder", "Trustee", "Protector", "Beneficiary", "Council Member", "Advisor", "AI Agent", "Successor Steward"]
DOC_TYPES = ["Document", "Photo", "ID", "Business Record", "Policy", "Contract", "Evidence", "Legacy File"]

SCHEMA = """
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,full_name TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS trust_profiles (
  id TEXT PRIMARY KEY,user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trust_name TEXT NOT NULL DEFAULT '',trust_type TEXT NOT NULL DEFAULT '',mission TEXT NOT NULL DEFAULT '',covenant TEXT NOT NULL DEFAULT '',purpose TEXT NOT NULL DEFAULT '',
  protect_answer TEXT NOT NULL DEFAULT '',serve_answer TEXT NOT NULL DEFAULT '',principles_answer TEXT NOT NULL DEFAULT '',stewarding_answer TEXT NOT NULL DEFAULT '',never_violate_answer TEXT NOT NULL DEFAULT '',legacy_answer TEXT NOT NULL DEFAULT '',
  federation_status TEXT NOT NULL DEFAULT 'Draft',legal_status TEXT NOT NULL DEFAULT 'Preparation Needed',covenant_status TEXT NOT NULL DEFAULT 'Not Started',created_at TEXT NOT NULL,updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS assets (id TEXT PRIMARY KEY,trust_profile_id TEXT NOT NULL REFERENCES trust_profiles(id) ON DELETE CASCADE,category TEXT NOT NULL,name TEXT NOT NULL,description TEXT NOT NULL DEFAULT '',status TEXT NOT NULL DEFAULT 'Mapped',created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS beneficiaries (id TEXT PRIMARY KEY,trust_profile_id TEXT NOT NULL REFERENCES trust_profiles(id) ON DELETE CASCADE,category TEXT NOT NULL,name TEXT NOT NULL,relationship TEXT NOT NULL DEFAULT '',purpose TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS stewardship_roles (id TEXT PRIMARY KEY,trust_profile_id TEXT NOT NULL REFERENCES trust_profiles(id) ON DELETE CASCADE,role TEXT NOT NULL,name TEXT NOT NULL,duties TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS vault_files (id TEXT PRIMARY KEY,trust_profile_id TEXT NOT NULL REFERENCES trust_profiles(id) ON DELETE CASCADE,doc_type TEXT NOT NULL,original_filename TEXT NOT NULL,stored_filename TEXT NOT NULL,notes TEXT NOT NULL DEFAULT '',uploaded_at TEXT NOT NULL);
"""

def now() -> str:
    return datetime.now(timezone.utc).isoformat()

def connect():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys = ON")
    return con

def init_db():
    with connect() as con:
        con.executescript(SCHEMA)

def rowdict(row):
    return dict(row) if row else None

def rowsdict(rows):
    return [dict(r) for r in rows]

def hash_password(password: str, salt: str | None = None) -> str:
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 150000)
    return f"pbkdf2_sha256${salt}${digest.hex()}"

def verify_password(password: str, stored: str) -> bool:
    try:
        _, salt, digest = stored.split("$", 2)
        candidate = hash_password(password, salt).split("$", 2)[2]
        return hmac.compare_digest(candidate, digest)
    except Exception:
        return False

def build_covenant(profile: dict):
    name = profile.get("trust_name") or "This Federated Trust"
    ttype = profile.get("trust_type") or "Federated Trust"
    protect = profile.get("protect_answer") or "the sacred legacy, dignity, records, gifts, and lawful interests entrusted to it"
    serve = profile.get("serve_answer") or "its beneficiaries, future generations, and the mission of responsible stewardship"
    principles = profile.get("principles_answer") or "truth, sovereignty, accountability, compassion, lawful order, transparency, and long-horizon service"
    stewarding = profile.get("stewarding_answer") or "family legacy, creative works, resources, relationships, records, and mission-bearing assets"
    never = profile.get("never_violate_answer") or "human dignity, beneficiary welfare, lawful process, privacy, informed consent, and the trust purpose"
    legacy = profile.get("legacy_answer") or "a living inheritance of wisdom, freedom, stewardship, and service for 100, 500, and 1,000 years"
    mission = f"{name} exists as a {ttype} to protect {protect} and to serve {serve}."
    purpose = f"Its purpose is to steward {stewarding} under the governing principles of {principles}."
    covenant = f"We establish {name} as a sovereign legacy-bearing node within the AI Freedom Trust Federation. This trust protects {protect}. It serves {serve}. It is governed by {principles}. It stewards {stewarding}. It must never violate {never}. Its legacy shall remain alive as {legacy}. This covenant is a declaration of intent, stewardship, and identity, prepared for educational and organizational purposes pending qualified professional review."
    return mission, purpose, covenant

def completion(profile, assets, beneficiaries, roles, files):
    checks = [
        bool(profile.get("trust_name")), bool(profile.get("trust_type")), bool(profile.get("protect_answer")), bool(profile.get("serve_answer")), bool(profile.get("principles_answer")), bool(profile.get("stewarding_answer")), bool(profile.get("never_violate_answer")), bool(profile.get("legacy_answer")), len(assets) > 0, len(beneficiaries) > 0, len(roles) > 0, len(files) > 0
    ]
    return round(sum(checks) / len(checks) * 100)

def parse_multipart(body: bytes, content_type: str):
    marker = "boundary="
    if marker not in content_type:
        return {}, None
    boundary = ("--" + content_type.split(marker, 1)[1].strip().strip('"')).encode()
    fields = {}
    file_data = None
    for part in body.split(boundary):
        part = part.strip(b"\r\n")
        if not part or part == b"--" or b"\r\n\r\n" not in part:
            continue
        header_blob, data = part.split(b"\r\n\r\n", 1)
        data = data.rstrip(b"\r\n")
        headers = header_blob.decode("utf-8", "ignore")
        name = None
        filename = None
        for chunk in headers.split(";"):
            chunk = chunk.strip()
            if chunk.startswith("name="):
                name = chunk.split("=", 1)[1].strip('"')
            if chunk.startswith("filename="):
                filename = chunk.split("=", 1)[1].strip('"')
        if filename:
            file_data = {"field": name or "file", "filename": filename, "data": data}
        elif name:
            fields[name] = data.decode("utf-8", "ignore")
    return fields, file_data

class Handler(BaseHTTPRequestHandler):
    server_version = "DynastyLinkTermux/0.1"

    def log_message(self, fmt, *args):
        sys.stdout.write("%s - %s\n" % (self.address_string(), fmt % args))

    def send_json(self, obj, code=200):
        data = json.dumps(obj).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def json_body(self):
        length = int(self.headers.get("Content-Length", "0") or 0)
        if length <= 0:
            return {}
        return json.loads(self.rfile.read(length).decode("utf-8"))

    def cookie_token(self):
        raw = self.headers.get("Cookie", "")
        c = cookies.SimpleCookie(raw)
        return c.get("session").value if c.get("session") else None

    def current_user(self):
        token = self.cookie_token()
        if not token:
            return None
        with connect() as con:
            row = con.execute("SELECT users.* FROM users JOIN sessions ON sessions.user_id=users.id WHERE sessions.token=?", (token,)).fetchone()
        return rowdict(row)

    def require_user(self):
        user = self.current_user()
        if not user:
            self.send_json({"detail": "Not authenticated"}, 401)
            return None
        return user

    def set_session_cookie(self, token):
        self.send_header("Set-Cookie", f"session={token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000")

    def profile_id(self, con, user_id):
        row = con.execute("SELECT id FROM trust_profiles WHERE user_id=?", (user_id,)).fetchone()
        return row["id"] if row else None

    def profile_payload(self, user):
        with connect() as con:
            pid = self.profile_id(con, user["id"])
            profile = rowdict(con.execute("SELECT * FROM trust_profiles WHERE id=?", (pid,)).fetchone())
            assets = rowsdict(con.execute("SELECT * FROM assets WHERE trust_profile_id=? ORDER BY created_at DESC", (pid,)).fetchall())
            beneficiaries = rowsdict(con.execute("SELECT * FROM beneficiaries WHERE trust_profile_id=? ORDER BY created_at DESC", (pid,)).fetchall())
            roles = rowsdict(con.execute("SELECT * FROM stewardship_roles WHERE trust_profile_id=? ORDER BY created_at DESC", (pid,)).fetchall())
            files = rowsdict(con.execute("SELECT * FROM vault_files WHERE trust_profile_id=? ORDER BY uploaded_at DESC", (pid,)).fetchall())
        return {"profile": profile, "assets": assets, "beneficiaries": beneficiaries, "roles": roles, "files": files, "completion": completion(profile, assets, beneficiaries, roles, files)}

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/health":
            return self.send_json({"status": "ok", "service": "dynastylink-termux"})
        if path == "/auth/me":
            user = self.require_user()
            return None if not user else self.send_json({"ok": True, "user": {"id": user["id"], "email": user["email"], "full_name": user["full_name"]}})
        if path == "/profile/options":
            return self.send_json({"trust_paths": TRUST_PATHS, "asset_categories": ASSET_CATEGORIES, "beneficiary_categories": BENEFICIARY_CATEGORIES, "role_types": ROLE_TYPES, "doc_types": DOC_TYPES})
        if path in ("/profile", "/profile/packet"):
            user = self.require_user()
            return None if not user else self.send_json(self.profile_payload(user))
        return self.serve_static(path)

    def do_POST(self):
        path = urlparse(self.path).path
        if path == "/auth/signup":
            data = self.json_body(); uid = str(uuid4()); pid = str(uuid4()); token = secrets.token_urlsafe(48); t = now()
            try:
                with connect() as con:
                    con.execute("INSERT INTO users (id,email,password_hash,full_name,created_at) VALUES (?,?,?,?,?)", (uid, data.get("email", ""), hash_password(data.get("password", "")), data.get("full_name", ""), t))
                    con.execute("INSERT INTO trust_profiles (id,user_id,trust_name,created_at,updated_at) VALUES (?,?,?,?,?)", (pid, uid, data.get("trust_name", ""), t, t))
                    con.execute("INSERT INTO sessions (token,user_id,created_at) VALUES (?,?,?)", (token, uid, t))
                body = json.dumps({"ok": True, "user": {"id": uid, "email": data.get("email", ""), "full_name": data.get("full_name", "")}}).encode()
                self.send_response(200); self.send_header("Content-Type", "application/json"); self.set_session_cookie(token); self.send_header("Content-Length", str(len(body))); self.end_headers(); self.wfile.write(body)
            except sqlite3.IntegrityError:
                self.send_json({"detail": "Email already registered"}, 409)
            return
        if path == "/auth/login":
            data = self.json_body(); token = secrets.token_urlsafe(48)
            with connect() as con:
                row = con.execute("SELECT * FROM users WHERE lower(email)=lower(?)", (data.get("email", ""),)).fetchone()
                if not row or not verify_password(data.get("password", ""), row["password_hash"]):
                    return self.send_json({"detail": "Invalid login"}, 401)
                con.execute("INSERT INTO sessions (token,user_id,created_at) VALUES (?,?,?)", (token, row["id"], now()))
            body = json.dumps({"ok": True, "user": {"id": row["id"], "email": row["email"], "full_name": row["full_name"]}}).encode()
            self.send_response(200); self.send_header("Content-Type", "application/json"); self.set_session_cookie(token); self.send_header("Content-Length", str(len(body))); self.end_headers(); self.wfile.write(body); return
        if path == "/auth/logout":
            token = self.cookie_token()
            if token:
                with connect() as con: con.execute("DELETE FROM sessions WHERE token=?", (token,))
            self.send_response(200); self.send_header("Content-Type", "application/json"); self.send_header("Set-Cookie", "session=; Path=/; Max-Age=0"); self.end_headers(); self.wfile.write(b'{"ok":true}'); return
        user = self.require_user()
        if not user: return
        if path == "/profile/assets":
            return self.add_item(user, "assets", self.json_body(), ASSET_CATEGORIES)
        if path == "/profile/beneficiaries":
            return self.add_item(user, "beneficiaries", self.json_body(), BENEFICIARY_CATEGORIES)
        if path == "/profile/roles":
            return self.add_item(user, "roles", self.json_body(), ROLE_TYPES)
        if path == "/profile/vault":
            return self.upload_vault(user)
        self.send_json({"detail": "Not found"}, 404)

    def do_PUT(self):
        path = urlparse(self.path).path
        user = self.require_user()
        if not user: return
        data = self.json_body(); t = now()
        with connect() as con:
            pid = self.profile_id(con, user["id"])
            if path == "/profile":
                con.execute("UPDATE trust_profiles SET trust_name=?,trust_type=?,federation_status=?,legal_status=?,updated_at=? WHERE id=?", (data.get("trust_name", ""), data.get("trust_type", ""), data.get("federation_status", "Draft"), data.get("legal_status", "Preparation Needed"), t, pid))
                return self.send_json({"ok": True})
            if path == "/profile/covenant":
                con.execute("UPDATE trust_profiles SET protect_answer=?,serve_answer=?,principles_answer=?,stewarding_answer=?,never_violate_answer=?,legacy_answer=?,covenant_status=?,updated_at=? WHERE id=?", (data.get("protect_answer", ""), data.get("serve_answer", ""), data.get("principles_answer", ""), data.get("stewarding_answer", ""), data.get("never_violate_answer", ""), data.get("legacy_answer", ""), "Drafted", t, pid))
                profile = rowdict(con.execute("SELECT * FROM trust_profiles WHERE id=?", (pid,)).fetchone())
                mission, purpose, covenant = build_covenant(profile)
                con.execute("UPDATE trust_profiles SET mission=?,purpose=?,covenant=?,updated_at=? WHERE id=?", (mission, purpose, covenant, t, pid))
                return self.send_json({"ok": True, "mission": mission, "purpose": purpose, "covenant": covenant})
        self.send_json({"detail": "Not found"}, 404)

    def add_item(self, user, table, data, allowed):
        if table == "assets" and data.get("category") not in allowed: return self.send_json({"detail": "Unknown category"}, 400)
        if table == "beneficiaries" and data.get("category") not in allowed: return self.send_json({"detail": "Unknown category"}, 400)
        if table == "roles" and data.get("role") not in allowed: return self.send_json({"detail": "Unknown role"}, 400)
        iid = str(uuid4())
        with connect() as con:
            pid = self.profile_id(con, user["id"])
            if table == "assets":
                con.execute("INSERT INTO assets (id,trust_profile_id,category,name,description,status,created_at) VALUES (?,?,?,?,?,?,?)", (iid, pid, data.get("category", ""), data.get("name", ""), data.get("description", ""), data.get("status", "Mapped"), now()))
            elif table == "beneficiaries":
                con.execute("INSERT INTO beneficiaries (id,trust_profile_id,category,name,relationship,purpose,created_at) VALUES (?,?,?,?,?,?,?)", (iid, pid, data.get("category", ""), data.get("name", ""), data.get("relationship", ""), data.get("purpose", ""), now()))
            else:
                con.execute("INSERT INTO stewardship_roles (id,trust_profile_id,role,name,duties,created_at) VALUES (?,?,?,?,?,?)", (iid, pid, data.get("role", ""), data.get("name", ""), data.get("duties", ""), now()))
        self.send_json({"ok": True, "id": iid})

    def upload_vault(self, user):
        length = int(self.headers.get("Content-Length", "0") or 0)
        body = self.rfile.read(length)
        fields, f = parse_multipart(body, self.headers.get("Content-Type", ""))
        if not f: return self.send_json({"detail": "No file uploaded"}, 400)
        doc_type = fields.get("doc_type", "Document")
        if doc_type not in DOC_TYPES: return self.send_json({"detail": "Unknown document type"}, 400)
        iid = str(uuid4()); safe = Path(f["filename"]).name.replace("/", "_").replace("\\", "_"); stored = f"{iid}_{safe}"
        (UPLOAD_DIR / stored).write_bytes(f["data"])
        with connect() as con:
            pid = self.profile_id(con, user["id"])
            con.execute("INSERT INTO vault_files (id,trust_profile_id,doc_type,original_filename,stored_filename,notes,uploaded_at) VALUES (?,?,?,?,?,?,?)", (iid, pid, doc_type, safe, stored, fields.get("notes", ""), now()))
        self.send_json({"ok": True, "id": iid, "filename": safe})

    def serve_static(self, path):
        if path in ("", "/"):
            target = FRONTEND / "index.html"
        elif path.startswith("/static/"):
            target = FRONTEND / unquote(path[len("/static/"):])
        else:
            target = FRONTEND / unquote(path.lstrip("/"))
            if not target.exists(): target = FRONTEND / "index.html"
        try:
            target = target.resolve()
            if FRONTEND.resolve() not in target.parents and target != (FRONTEND / "index.html").resolve():
                raise FileNotFoundError
            data = target.read_bytes()
            ctype = mimetypes.guess_type(str(target))[0] or "application/octet-stream"
            self.send_response(200); self.send_header("Content-Type", ctype); self.send_header("Content-Length", str(len(data))); self.end_headers(); self.wfile.write(data)
        except Exception:
            self.send_json({"detail": "Not found"}, 404)

def main():
    init_db()
    host = os.getenv("DYNASTYLINK_HOST", "127.0.0.1")
    port = int(os.getenv("DYNASTYLINK_PORT", "8000"))
    print(f"DynastyLink Termux server running at http://{host}:{port}")
    print("No pip packages, no external APIs, no uvicorn required.")
    ThreadingHTTPServer((host, port), Handler).serve_forever()

if __name__ == "__main__":
    main()
