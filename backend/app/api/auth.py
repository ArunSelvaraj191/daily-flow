from fastapi import APIRouter, Depends, status

from app.db.mongodb import get_database
from app.dependencies.auth import get_current_user
from app.schemas.auth import (
    ChangePasswordRequest,
    TokenResponse,
    UpdateProfileRequest,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from app.schemas.common import MessageResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(req: UserRegisterRequest, db=Depends(get_database)):
    service = AuthService(db)
    result = await service.register(req)
    return {
        "accessToken": result["token"],
        "tokenType": "bearer",
        "user": result["user"]
    }


@router.post("/login", response_model=TokenResponse)
async def login(req: UserLoginRequest, db=Depends(get_database)):
    service = AuthService(db)
    result = await service.login(req)
    return {
        "accessToken": result["token"],
        "tokenType": "bearer",
        "user": result["user"]
    }


@router.post("/logout", response_model=MessageResponse)
async def logout(current_user=Depends(get_current_user)):
    return {"message": "Logged out successfully", "success": True}


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user=Depends(get_current_user)):
    return current_user


@router.patch("/profile", response_model=UserResponse)
async def update_profile(
    req: UpdateProfileRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    service = AuthService(db)
    user = await service.update_profile(current_user["id"], req)
    return user


@router.post("/change-password", response_model=MessageResponse)
async def change_password(
    req: ChangePasswordRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    service = AuthService(db)
    await service.change_password(current_user["id"], req)
    return {"message": "Password changed successfully", "success": True}
