from datetime import date, timedelta
from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.repositories.activity_repository import ActivityRepository
from app.repositories.goal_repository import GoalRepository
from app.repositories.habit_repository import HabitRepository


class DashboardService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.activity_repo = ActivityRepository(db)
        self.habit_repo = HabitRepository(db)
        self.goal_repo = GoalRepository(db)

    def resolve_date_range(
        self,
        preset: str | None = None,
        start_date: str | None = None,
        end_date: str | None = None
    ) -> tuple[str, str]:
        today = date.today()
        if preset == "today":
            return today.isoformat(), today.isoformat()
        elif preset == "yesterday":
            y = today - timedelta(days=1)
            return y.isoformat(), y.isoformat()
        elif preset == "this_week":
            start_w = today - timedelta(days=today.weekday())
            return start_w.isoformat(), today.isoformat()
        elif preset == "this_month":
            start_m = today.replace(day=1)
            return start_m.isoformat(), today.isoformat()
        elif start_date and end_date:
            return start_date, end_date
        # Default: this week
        start_w = today - timedelta(days=today.weekday())
        return start_w.isoformat(), today.isoformat()

    async def get_summary(
        self,
        user_id: str,
        preset: str | None = "this_week",
        start_date: str | None = None,
        end_date: str | None = None
    ) -> dict[str, Any]:
        s_date, e_date = self.resolve_date_range(preset, start_date, end_date)
        summary = await self.activity_repo.aggregate_dashboard_summary(user_id, s_date, e_date)

        # Habit streak
        habits = await self.habit_repo.list_habits(user_id, active_only=True)
        max_streak = max([h.get("currentStreak", 0) for h in habits], default=0)
        summary["activeHabitStreak"] = max_streak

        # Goals progress
        goals = await self.goal_repo.list_goals(user_id)
        if goals:
            completed_goals = sum(1 for g in goals if g.get("status") == "completed" or g.get("progressPercentage", 0) >= 100)
            summary["goalCompletionRate"] = round((completed_goals / len(goals)) * 100, 1)
            summary["activeGoalsCount"] = len(goals)
        else:
            summary["goalCompletionRate"] = 0.0
            summary["activeGoalsCount"] = 0

        return summary

    async def get_activity_trends(
        self,
        user_id: str,
        days: int = 7
    ) -> list[dict[str, Any]]:
        today = date.today()
        start = today - timedelta(days=days - 1)
        activities = await self.activity_repo.get_all_by_range(user_id, start.isoformat(), today.isoformat())

        day_map: dict[str, dict[str, Any]] = {}
        curr = start
        while curr <= today:
            d_str = curr.isoformat()
            day_map[d_str] = {
                "date": d_str,
                "completed": 0,
                "pending": 0,
                "total": 0,
                "trackedMinutes": 0,
                "plannedMinutes": 0
            }
            curr += timedelta(days=1)

        for act in activities:
            d = act.get("activityDate")
            if d in day_map:
                day_map[d]["total"] += 1
                if act.get("status") == "Completed":
                    day_map[d]["completed"] += 1
                else:
                    day_map[d]["pending"] += 1
                day_map[d]["trackedMinutes"] += act.get("actualDuration", 0)
                day_map[d]["plannedMinutes"] += act.get("plannedDuration", 0)

        return sorted(day_map.values(), key=lambda x: x["date"])

    async def get_time_distribution(
        self,
        user_id: str,
        preset: str | None = "this_week",
        start_date: str | None = None,
        end_date: str | None = None
    ) -> list[dict[str, Any]]:
        s_date, e_date = self.resolve_date_range(preset, start_date, end_date)
        return await self.activity_repo.aggregate_category_distribution(user_id, s_date, e_date)
