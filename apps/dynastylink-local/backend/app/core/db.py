from __future__ import annotations

import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[3]
DATA_DIR = Path(os.getenv("DYNASTYLINK_DATA_DIR", BASE_DIR / "data"))
DB_PATH = Path(os.getenv("DYNASTYLINK_DB_PATH", DATA_DIR / "dynastylink.sqlite3"))
UPLOAD_DIR = Path(os.getenv("DYNASTYLINK_UPLOAD_DIR", DATA_DIR / "uploads"))

DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

SCHEMA = """
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS trust_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trust_name TEXT NOT NULL DEFAULT '',
    trust_type TEXT NOT NULL DEFAULT '',
    mission TEXT NOT NULL DEFAULT '',
    covenant TEXT NOT NULL DEFAULT '',
    purpose TEXT NOT NULL DEFAULT '',
    protect_answer TEXT NOT NULL DEFAULT '',
    serve_answer TEXT NOT NULL DEFAULT '',
    principles_answer TEXT NOT NULL DEFAULT '',
    stewarding_answer TEXT NOT NULL DEFAULT '',
    never_violate_answer TEXT NOT NULL DEFAULT '',
    legacy_answer TEXT NOT NULL DEFAULT '',
    federation_status TEXT NOT NULL DEFAULT 'Draft',
    legal_status TEXT NOT NULL DEFAULT 'Preparation Needed',
    covenant_status TEXT NOT NULL DEFAULT 'Not Started',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    trust_profile_id TEXT NOT NULL REFERENCES trust_profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Mapped',
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS beneficiaries (
    id TEXT PRIMARY KEY,
    trust_profile_id TEXT NOT NULL REFERENCES trust_profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    relationship TEXT NOT NULL DEFAULT '',
    purpose TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS stewardship_roles (
    id TEXT PRIMARY KEY,
    trust_profile_id TEXT NOT NULL REFERENCES trust_profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    name TEXT NOT NULL,
    duties TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS vault_files (
    id TEXT PRIMARY KEY,
    trust_profile_id TEXT NOT NULL REFERENCES trust_profiles(id) ON DELETE CASCADE,
    doc_type TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    stored_filename TEXT NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    uploaded_at TEXT NOT NULL
);
"""

@contextmanager
def db():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    try:
        con.execute("PRAGMA foreign_keys = ON")
        yield con
        con.commit()
    finally:
        con.close()


def init_db() -> None:
    with db() as con:
        con.executescript(SCHEMA)


def row_to_dict(row):
    return dict(row) if row else None


def rows_to_dicts(rows):
    return [dict(r) for r in rows]
