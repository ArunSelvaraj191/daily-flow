from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserPreferences(BaseModel):
    theme: str = "light"  # "light" | "dark"
    timezone: str = "UTC"
    dailyGoalMinutes: int = 480
    defaultCategory: str = "Work"


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    fullName: str = Field(..., min_length=2, max_length=100)
    timezone: str | None = "UTC"


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    accessToken: str
    tokenType: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    fullName: str
    timezone: str = "UTC"
    preferences: UserPreferences
    createdAt: datetime
    updatedAt: datetime


class UpdateProfileRequest(BaseModel):
    fullName: str | None = Field(None, min_length=2, max_length=100)
    timezone: str | None = None
    preferences: UserPreferences | None = None


class ChangePasswordRequest(BaseModel):
    currentPassword: str
    newPassword: str = Field(..., min_length=6, max_length=128)


TokenResponse.model_rebuild()
