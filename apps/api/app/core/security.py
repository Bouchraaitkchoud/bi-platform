# apps/api/app/core/security.py
from datetime import datetime, timedelta
from typing import Optional, Tuple
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings
from cryptography.fernet import Fernet, InvalidToken

# Password hashing - use argon2 to avoid bcrypt's 72-byte limitation
# Try to include bcrypt for legacy password support, but catch initialization errors
try:
    pwd_context = CryptContext(
        schemes=["argon2", "bcrypt"],
        deprecated="bcrypt"
    )
except Exception:
    # If bcrypt fails to initialize, use only argon2
    pwd_context = CryptContext(schemes=["argon2"])

# Token expiry times (spec: 24h access, 7d refresh)
ACCESS_TOKEN_EXPIRE_SECONDS = 24 * 60 * 60  # 24 hours
REFRESH_TOKEN_EXPIRE_SECONDS = 7 * 24 * 60 * 60  # 7 days


def get_password_hash(password: str) -> str:
    """Hash a password for storage using argon2"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    try:
        result = pwd_context.verify(plain_password, hashed_password)
        return result
    except ValueError as e:
        # Handle bcrypt's 72-byte limit for legacy passwords
        print(f"[DEBUG] ValueError during password verification: {e}")
        try:
            return pwd_context.verify(plain_password[:72], hashed_password)
        except Exception as ex:
            print(f"[DEBUG] Fallback verification also failed: {ex}")
            return False
    except Exception as e:
        # Catch any other exceptions and log them
        print(f"[DEBUG] Unexpected exception during password verification: {type(e).__name__}: {e}")
        return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> Tuple[str, int]:
    """
    Create a JWT access token (expires in 24 hours)
    Returns: (token, expires_in_seconds)
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
        expire_seconds = int(expires_delta.total_seconds())
    else:
        expire = datetime.utcnow() + timedelta(seconds=ACCESS_TOKEN_EXPIRE_SECONDS)
        expire_seconds = ACCESS_TOKEN_EXPIRE_SECONDS
    
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt, expire_seconds


def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT refresh token (expires in 7 days)
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(seconds=REFRESH_TOKEN_EXPIRE_SECONDS)
    
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def verify_token(token: str, token_type: str = "access") -> Optional[dict]:
    """
    Verify a JWT token and check type
    Returns: payload dict if valid, None if invalid
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        
        # Verify token type
        if payload.get("type") != token_type:
            return None
        
        return payload
    except JWTError:
        return None


def _get_fernet() -> Fernet:
    return Fernet(settings.ENCRYPTION_KEY)


def encrypt_value(value: str) -> str:
    if value is None:
        return ""
    token = _get_fernet().encrypt(value.encode("utf-8")).decode("utf-8")
    return f"enc:{token}"


def decrypt_value(value: str) -> str:
    if not value:
        return ""
    if value.startswith("enc:"):
        token = value[4:]
    else:
        token = value
    return _get_fernet().decrypt(token.encode("utf-8")).decode("utf-8")


def is_encrypted_value(value: str) -> bool:
    return isinstance(value, str) and value.startswith("enc:")
