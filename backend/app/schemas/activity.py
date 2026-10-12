from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class ActivityCategory(str, Enum):
    WORK = "Work"
    LEARNING = "Learning"
    FITNESS = "Fitness"
    PERSONAL = "Personal"
    HEALTH = "Health"
    TEACHING = "Teaching"
    CONTENT_CREATION = "Content Creation"
    OTHER = "Other"


class ActivityPriority(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    URGENT = "Urgent"


class ActivityStatus(str, Enum):
    PENDING = "Pending"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"


class ActivityBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str | None = ""
    category: ActivityCategory = ActivityCategory.WORK
    priority: ActivityPriority = ActivityPriority.MEDIUM
    status: ActivityStatus = ActivityStatus.PENDING
    activityDate: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")  # YYYY-MM-DD
    plannedStartTime: str | None = None  # HH:MM
    plannedEndTime: str | None = None  # HH:MM
    plannedDuration: int = Field(default=30, ge=0)  # minutes
    actualDuration: int = Field(default=0, ge=0)  # minutes
    tags: list[str] = Field(default_factory=list)
    notes: str | None = ""


class ActivityCreateRequest(ActivityBase):
    pass


class ActivityUpdateRequest(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = None
    category: ActivityCategory | None = None
    priority: ActivityPriority | None = None
    status: ActivityStatus | None = None
    activityDate: str | None = Field(None, pattern=r"^\d{4}-\d{2}-\d{2}$")
    plannedStartTime: str | None = None
    plannedEndTime: str | None = None
    plannedDuration: int | None = Field(None, ge=0)
    actualDuration: int | None = Field(None, ge=0)
    tags: list[str] | None = None
    notes: str | None = None


class ActivityResponse(ActivityBase):
    id: str
    userId: str
    createdAt: datetime
    updatedAt: datetime


class ActivityFilterParams(BaseModel):
    date: str | None = None
    startDate: str | None = None
    endDate: str | None = None
    category: str | None = None
    status: str | None = None
    priority: str | None = None
    search: str | None = None
    page: int = 1
    pageSize: int = 20
    sortBy: str = "activityDate"
    sortOrder: str = "desc"  # "asc" or "desc"
