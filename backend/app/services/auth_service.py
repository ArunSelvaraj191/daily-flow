from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.exceptions import BadRequestException, ConflictException, UnauthorizedException
from app.core.security import create_access_token, hash_password, verify_password
from app.repositories.user_repository import UserRepository
from app.schemas.auth import (
    ChangePasswordRequest,
    UpdateProfileRequest,
    UserLoginRequest,
    UserRegisterRequest,
)


class AuthService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.repo = UserRepository(db)

    async def register(self, req: UserRegisterRequest) -> dict[str, Any]:
        existing = await self.repo.get_by_email(req.email)
        if existing:
            raise ConflictException("A user with this email address already exists.")

        user_doc = {
            "email": req.email,
            "passwordHash": hash_password(req.password),
            "fullName": req.fullName,
            "timezone": req.timezone or "UTC",
            "preferences": {
                "theme": "light",
                "timezone": req.timezone or "UTC",
                "dailyGoalMinutes": 480,
                "defaultCategory": "Work"
            }
        }
        user = await self.repo.create(user_doc)
        token = create_access_token(user["id"])
        return {"token": token, "user": user}

    async def login(self, req: UserLoginRequest) -> dict[str, Any]:
        user = await self.repo.get_by_email(req.email)
        if not user:
            raise UnauthorizedException("Invalid email or password.")

        if not verify_password(req.password, user.get("passwordHash", "")):
            raise UnauthorizedException("Invalid email or password.")

        token = create_access_token(user["id"])
        return {"token": token, "user": user}

    async def change_password(self, user_id: str, req: ChangePasswordRequest) -> None:
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise UnauthorizedException("User not found.")

        if not verify_password(req.currentPassword, user.get("passwordHash", "")):
            raise BadRequestException("Current password does not match.")

        new_hash = hash_password(req.newPassword)
        await self.repo.update(user_id, {"passwordHash": new_hash})

    async def update_profile(self, user_id: str, req: UpdateProfileRequest) -> dict[str, Any]:
        update_data = {}
        if req.fullName is not None:
            update_data["fullName"] = req.fullName
        if req.timezone is not None:
            update_data["timezone"] = req.timezone
        if req.preferences is not None:
            update_data["preferences"] = req.preferences.model_dump()

        if update_data:
            user = await self.repo.update(user_id, update_data)
            return user
        return await self.repo.get_by_id(user_id)
