from pydantic import BaseModel


class DashboardSummaryResponse(BaseModel):
    totalActivities: int = 0
    completedActivities: int = 0
    pendingActivities: int = 0
    inProgressActivities: int = 0
    completionRate: float = 0.0  # Percentage
    totalTimeTrackedMinutes: int = 0
    productiveHours: float = 0.0
    plannedTimeMinutes: int = 0
    activeHabitStreak: int = 0
    goalCompletionRate: float = 0.0
    activeGoalsCount: int = 0


class ActivityTrendPoint(BaseModel):
    date: str
    completed: int = 0
    pending: int = 0
    total: int = 0
    trackedMinutes: int = 0
    plannedMinutes: int = 0


class CategoryDistributionItem(BaseModel):
    category: str
    minutes: int = 0
    hours: float = 0.0
    percentage: float = 0.0
    activityCount: int = 0


class WeeklyProductivityItem(BaseModel):
    day: str  # e.g., "Mon", "Tue"
    date: str
    actualHours: float = 0.0
    plannedHours: float = 0.0
    completedCount: int = 0


class DashboardTrendsResponse(BaseModel):
    trends: list[ActivityTrendPoint]
    categoryDistribution: list[CategoryDistributionItem]
    weeklyProductivity: list[WeeklyProductivityItem]
