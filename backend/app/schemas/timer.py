from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class TimerStatus(str, Enum):
    RUNNING = "running"
    PAUSED = "paused"
    STOPPED = "stopped"


class TimerSegment(BaseModel):
    startTime: datetime
    endTime: datetime | None = None
    durationSeconds: int = 0


class TimerStartRequest(BaseModel):
    activityId: str
    notes: str | None = ""


class TimerSessionResponse(BaseModel):
    id: str
    userId: str
    activityId: str
    activityTitle: str | None = ""
    status: TimerStatus
    startedAt: datetime
    pausedAt: datetime | None = None
    stoppedAt: datetime | None = None
    accumulatedSeconds: int = 0
    currentElapsedSeconds: int = 0
    segments: list[TimerSegment] = Field(default_factory=list)
    createdAt: datetime
    updatedAt: datetime


class ActiveTimerResponse(BaseModel):
    hasActiveTimer: bool
    session: TimerSessionResponse | None = None
