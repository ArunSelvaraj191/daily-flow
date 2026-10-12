from typing import Any

from pydantic import BaseModel

from app.schemas.activity import ActivityResponse
from app.schemas.dashboard import CategoryDistributionItem


class DailyReportResponse(BaseModel):
    date: str
    plannedActivitiesCount: int
    completedActivitiesCount: int
    completionRate: float
    actualTrackedMinutes: int
    plannedMinutes: int
    categoryDistribution: list[CategoryDistributionItem]
    completedActivities: list[ActivityResponse]
    incompleteActivities: list[ActivityResponse]


class WeeklyReportResponse(BaseModel):
    startDate: str
    endDate: str
    totalTrackedMinutes: int
    totalPlannedMinutes: int
    completedActivitiesCount: int
    totalActivitiesCount: int
    completionRate: float
    categoryDistribution: list[CategoryDistributionItem]
    dailyBreakdown: list[dict[str, Any]]
    habitConsistencyRate: float
    goalsProgressSummary: list[dict[str, Any]]


class MonthlyReportResponse(BaseModel):
    month: str  # YYYY-MM
    totalTrackedMinutes: int
    totalPlannedMinutes: int
    completedActivitiesCount: int
    totalActivitiesCount: int
    completionRate: float
    categoryDistribution: list[CategoryDistributionItem]
    weeklyTrends: list[dict[str, Any]]
    habitCompletionRate: float
    goalCompletionRate: float


class AIInsightResponse(BaseModel):
    summary: str
    strengths: list[str]
    areasForImprovement: list[str]
    actionableSuggestions: list[str]
    quoteOfTheDay: str
