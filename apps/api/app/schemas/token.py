# apps/api/app/schemas/token.py
from pydantic import BaseModel, EmailStr
from typing import Optional


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int  # Access token expiry in seconds (24 hours = 86400)


class TokenData(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None
    token_type: Optional[str] = None  # "access" or "refresh"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str
