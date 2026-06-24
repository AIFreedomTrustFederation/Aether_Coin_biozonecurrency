from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response
from pydantic import BaseModel, EmailStr, Field

from app.core.db import db, row_to_dict
from app.core.security import hash_password, new_token, verify_password

router = APIRouter()


def now():
    return datetime.now(timezone.utc).isoformat()


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=1)
    trust_name: str = Field(default="")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


def get_current_user(session: str | None = Cookie(default=None)):
    if not session:
        raise HTTPException(status_code=401, detail="Not authenticated")
    with db() as con:
        row = con.execute(
            "SELECT users.* FROM users JOIN sessions ON sessions.user_id = users.id WHERE sessions.token = ?",
            (session,),
        ).fetchone()
    if not row:
        raise HTTPException(status_code=401, detail="Invalid session")
    return dict(row)


@router.post("/signup")
def signup(payload: SignupRequest, response: Response):
    user_id = str(uuid4())
    profile_id = str(uuid4())
    created = now()
    token = new_token()
    with db() as con:
        existing = con.execute("SELECT id FROM users WHERE lower(email)=lower(?)", (payload.email,)).fetchone()
        if existing:
            raise HTTPException(status_code=409, detail="Email already registered")
        con.execute(
            "INSERT INTO users (id,email,password_hash,full_name,created_at) VALUES (?,?,?,?,?)",
            (user_id, payload.email, hash_password(payload.password), payload.full_name, created),
        )
        con.execute(
            "INSERT INTO trust_profiles (id,user_id,trust_name,created_at,updated_at) VALUES (?,?,?,?,?)",
            (profile_id, user_id, payload.trust_name, created, created),
        )
        con.execute("INSERT INTO sessions (token,user_id,created_at) VALUES (?,?,?)", (token, user_id, created))
    response.set_cookie("session", token, httponly=True, samesite="lax", secure=False, max_age=60 * 60 * 24 * 30)
    return {"ok": True, "user": {"id": user_id, "email": payload.email, "full_name": payload.full_name}}


@router.post("/login")
def login(payload: LoginRequest, response: Response):
    token = new_token()
    created = now()
    with db() as con:
        row = con.execute("SELECT * FROM users WHERE lower(email)=lower(?)", (payload.email,)).fetchone()
        if not row or not verify_password(payload.password, row["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid login")
        con.execute("INSERT INTO sessions (token,user_id,created_at) VALUES (?,?,?)", (token, row["id"], created))
    response.set_cookie("session", token, httponly=True, samesite="lax", secure=False, max_age=60 * 60 * 24 * 30)
    return {"ok": True, "user": {"id": row["id"], "email": row["email"], "full_name": row["full_name"]}}


@router.post("/logout")
def logout(response: Response, session: str | None = Cookie(default=None)):
    if session:
        with db() as con:
            con.execute("DELETE FROM sessions WHERE token=?", (session,))
    response.delete_cookie("session")
    return {"ok": True}


@router.get("/me")
def me(user=Depends(get_current_user)):
    return {"ok": True, "user": {"id": user["id"], "email": user["email"], "full_name": user["full_name"]}}
