from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class GoalMetricType(str, Enum):
    DURATION_MINUTES = "duration_minutes"
    ACTIVITY_COUNT = "activity_count"
    HABIT_COUNT = "habit_count"


class GoalMeasurementPeriod(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class GoalStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class GoalBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=150)
    description: str | None = ""
    category: str = "General"
    metricType: GoalMetricType = GoalMetricType.DURATION_MINUTES
    targetValue: float = Field(..., gt=0)
    measurementPeriod: GoalMeasurementPeriod = GoalMeasurementPeriod.WEEKLY
    startDate: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    endDate: str | None = Field(None, pattern=r"^\d{4}-\d{2}-\d{2}$")
    status: GoalStatus = GoalStatus.ACTIVE


class GoalCreateRequest(GoalBase):
    pass


class GoalUpdateRequest(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=150)
    description: str | None = None
    category: str | None = None
    metricType: GoalMetricType | None = None
    targetValue: float | None = Field(None, gt=0)
    measurementPeriod: GoalMeasurementPeriod | None = None
    startDate: str | None = Field(None, pattern=r"^\d{4}-\d{2}-\d{2}$")
    endDate: str | None = Field(None, pattern=r"^\d{4}-\d{2}-\d{2}$")
    status: GoalStatus | None = None


class GoalResponse(GoalBase):
    id: str
    userId: str
    currentValue: float = 0.0
    progressPercentage: float = 0.0
    isOverdue: bool = False
    createdAt: datetime
    updatedAt: datetime
