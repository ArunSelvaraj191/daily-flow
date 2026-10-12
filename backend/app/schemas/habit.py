from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class HabitFrequency(str, Enum):
    DAILY = "daily"
    WEEKDAYS = "weekdays"  # specific days
    WEEKLY = "weekly"


class HabitBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    description: str | None = ""
    category: str = "Health"
    frequency: HabitFrequency = HabitFrequency.DAILY
    selectedWeekdays: list[int] = Field(default_factory=lambda: [0, 1, 2, 3, 4, 5, 6])  # 0=Monday, 6=Sunday
    targetDuration: int = Field(default=15, ge=0)  # minutes
    targetCount: int = Field(default=1, ge=1)
    startDate: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    endDate: str | None = Field(None, pattern=r"^\d{4}-\d{2}-\d{2}$")
    isActive: bool = True


class HabitCreateRequest(HabitBase):
    pass


class HabitUpdateRequest(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=150)
    description: str | None = None
    category: str | None = None
    frequency: HabitFrequency | None = None
    selectedWeekdays: list[int] | None = None
    targetDuration: int | None = Field(None, ge=0)
    targetCount: int | None = Field(None, ge=1)
    startDate: str | None = Field(None, pattern=r"^\d{4}-\d{2}-\d{2}$")
    endDate: str | None = Field(None, pattern=r"^\d{4}-\d{2}-\d{2}$")
    isActive: bool | None = None


class HabitLogRequest(BaseModel):
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    completed: bool = True
    durationMinutes: int = Field(default=0, ge=0)
    notes: str | None = ""


class HabitLogResponse(BaseModel):
    id: str
    habitId: str
    userId: str
    date: str
    completed: bool
    durationMinutes: int
    notes: str | None = ""
    createdAt: datetime


class HabitResponse(HabitBase):
    id: str
    userId: str
    currentStreak: int = 0
    longestStreak: int = 0
    completedToday: bool = False
    weeklyCompletionRate: float = 0.0  # percentage 0-100
    createdAt: datetime
    updatedAt: datetime
