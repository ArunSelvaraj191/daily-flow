from typing import Any

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.exceptions import UnauthorizedException
from app.core.security import decode_access_token
from app.db.mongodb import get_database
from app.repositories.user_repository import UserRepository

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db=Depends(get_database)
) -> dict[str, Any]:
    if not credentials or not credentials.credentials:
        raise UnauthorizedException("Authentication token is required")

    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise UnauthorizedException("Invalid or expired authentication token")

    user_id: str = payload.get("sub")
    if not user_id:
        raise UnauthorizedException("Authentication token missing subject")

    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if not user:
        raise UnauthorizedException("User not found or account deactivated")

    return user
