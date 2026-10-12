from datetime import UTC, datetime, timedelta
from typing import Any

import jwt

try:
    from pwdlib import PasswordHash
    from pwdlib.hashers.argon2 import Argon2Hasher
    password_hash = PasswordHash((Argon2Hasher(),))
except ImportError:
    # Fallback to direct argon2 or passlib if pwdlib submodule differences exist
    try:
        from passlib.context import CryptContext
        _pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")
        class _FallbackPasswordHash:
            def hash(self, password: str) -> str:
                return _pwd_context.hash(password)
            def verify(self, password: str, hashed: str) -> bool:
                return _pwd_context.verify(password, hashed)
        password_hash = _FallbackPasswordHash()
    except Exception:
        import hashlib
        import secrets
        class _BasicArgonFallback:
            def hash(self, password: str) -> str:
                salt = secrets.token_hex(16)
                h = hashlib.sha256((salt + password).encode()).hexdigest()
                return f"sha256${salt}${h}"
            def verify(self, password: str, hashed: str) -> bool:
                try:
                    _, salt, h = hashed.split("$")
                    return hashlib.sha256((salt + password).encode()).hexdigest() == h
                except Exception:
                    return False
        password_hash = _BasicArgonFallback()

from app.core.config import settings


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return password_hash.verify(plain_password, hashed_password)
    except Exception:
        return False


def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "sub": str(subject),
        "exp": expire,
        "iat": datetime.now(UTC)
    }
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> dict[str, Any] | None:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None
