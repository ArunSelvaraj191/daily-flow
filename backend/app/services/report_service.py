import csv
import io
from datetime import date, timedelta
from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.repositories.activity_repository import ActivityRepository
from app.repositories.goal_repository import GoalRepository
from app.repositories.habit_repository import HabitRepository


def sanitize_csv_cell(val: Any) -> str:
    """Protect CSV against CSV formula injection (=, +, -, @, etc.)"""
    if val is None:
        return ""
    text = str(val).strip()
    if text and text[0] in ("=", "+", "-", "@", "\t", "\r"):
        return "'" + text
    return text


class ReportService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.activity_repo = ActivityRepository(db)
        self.habit_repo = HabitRepository(db)
        self.goal_repo = GoalRepository(db)

    async def get_daily_report(self, user_id: str, report_date: str | None = None) -> dict[str, Any]:
        target_date = report_date or date.today().isoformat()
        items, _ = await self.activity_repo.list_activities(
            user_id=user_id,
            date=target_date,
            page_size=100
        )
        completed = [item for item in items if item.get("status") == "Completed"]
        incomplete = [item for item in items if item.get("status") != "Completed"]
        
        total_count = len(items)
        completed_count = len(completed)
        rate = round((completed_count / total_count * 100), 1) if total_count > 0 else 0.0
        actual_tracked = sum(item.get("actualDuration", 0) for item in items)
        planned_total = sum(item.get("plannedDuration", 0) for item in items)

        category_dist = await self.activity_repo.aggregate_category_distribution(
            user_id, target_date, target_date
        )

        return {
            "date": target_date,
            "plannedActivitiesCount": total_count,
            "completedActivitiesCount": completed_count,
            "completionRate": rate,
            "actualTrackedMinutes": actual_tracked,
            "plannedMinutes": planned_total,
            "categoryDistribution": category_dist,
            "completedActivities": completed,
            "incompleteActivities": incomplete
        }

    async def get_weekly_report(
        self,
        user_id: str,
        start_date: str | None = None,
        end_date: str | None = None
    ) -> dict[str, Any]:
        today = date.today()
        if not start_date or not end_date:
            start_d = today - timedelta(days=today.weekday())
            end_d = today
        else:
            start_d = date.fromisoformat(start_date)
            end_d = date.fromisoformat(end_date)

        activities = await self.activity_repo.get_all_by_range(
            user_id, start_d.isoformat(), end_d.isoformat()
        )
        total_tracked = sum(a.get("actualDuration", 0) for a in activities)
        total_planned = sum(a.get("plannedDuration", 0) for a in activities)
        completed_count = sum(1 for a in activities if a.get("status") == "Completed")
        total_count = len(activities)
        rate = round((completed_count / total_count * 100), 1) if total_count > 0 else 0.0

        category_dist = await self.activity_repo.aggregate_category_distribution(
            user_id, start_d.isoformat(), end_d.isoformat()
        )

        # Daily breakdown
        days_map: dict[str, dict[str, Any]] = {}
        curr = start_d
        while curr <= end_d:
            days_map[curr.isoformat()] = {
                "date": curr.isoformat(),
                "day": curr.strftime("%a"),
                "trackedMinutes": 0,
                "plannedMinutes": 0,
                "completed": 0,
                "total": 0
            }
            curr += timedelta(days=1)

        for a in activities:
            d = a.get("activityDate")
            if d in days_map:
                days_map[d]["total"] += 1
                days_map[d]["trackedMinutes"] += a.get("actualDuration", 0)
                days_map[d]["plannedMinutes"] += a.get("plannedDuration", 0)
                if a.get("status") == "Completed":
                    days_map[d]["completed"] += 1

        # Habit consistency
        habits = await self.habit_repo.list_habits(user_id, active_only=True)
        avg_habit_rate = (
            round(sum(h.get("weeklyCompletionRate", 0.0) for h in habits) / len(habits), 1)
            if habits else 0.0
        )

        goals = await self.goal_repo.list_goals(user_id)
        goals_summary = [
            {
                "title": g.get("title"),
                "targetValue": g.get("targetValue"),
                "currentValue": g.get("currentValue"),
                "progressPercentage": g.get("progressPercentage"),
                "status": g.get("status")
            }
            for g in goals
        ]

        return {
            "startDate": start_d.isoformat(),
            "endDate": end_d.isoformat(),
            "totalTrackedMinutes": total_tracked,
            "totalPlannedMinutes": total_planned,
            "completedActivitiesCount": completed_count,
            "totalActivitiesCount": total_count,
            "completionRate": rate,
            "categoryDistribution": category_dist,
            "dailyBreakdown": list(days_map.values()),
            "habitConsistencyRate": avg_habit_rate,
            "goalsProgressSummary": goals_summary
        }

    async def get_monthly_report(self, user_id: str, month_str: str | None = None) -> dict[str, Any]:
        today = date.today()
        if not month_str:
            month_str = today.strftime("%Y-%m")
        
        y, m = map(int, month_str.split("-"))
        start_d = date(y, m, 1)
        if m == 12:
            end_d = date(y + 1, 1, 1) - timedelta(days=1)
        else:
            end_d = date(y, m + 1, 1) - timedelta(days=1)

        activities = await self.activity_repo.get_all_by_range(
            user_id, start_d.isoformat(), end_d.isoformat()
        )
        total_tracked = sum(a.get("actualDuration", 0) for a in activities)
        total_planned = sum(a.get("plannedDuration", 0) for a in activities)
        completed_count = sum(1 for a in activities if a.get("status") == "Completed")
        total_count = len(activities)
        rate = round((completed_count / total_count * 100), 1) if total_count > 0 else 0.0

        category_dist = await self.activity_repo.aggregate_category_distribution(
            user_id, start_d.isoformat(), end_d.isoformat()
        )

        habits = await self.habit_repo.list_habits(user_id, active_only=True)
        habit_rate = (
            round(sum(h.get("weeklyCompletionRate", 0.0) for h in habits) / len(habits), 1)
            if habits else 0.0
        )

        goals = await self.goal_repo.list_goals(user_id)
        goal_rate = (
            round(
                sum(1 for g in goals if g.get("status") == "completed" or g.get("progressPercentage", 0) >= 100)
                / len(goals) * 100,
                1
            )
            if goals else 0.0
        )

        return {
            "month": month_str,
            "totalTrackedMinutes": total_tracked,
            "totalPlannedMinutes": total_planned,
            "completedActivitiesCount": completed_count,
            "totalActivitiesCount": total_count,
            "completionRate": rate,
            "categoryDistribution": category_dist,
            "weeklyTrends": [],
            "habitCompletionRate": habit_rate,
            "goalCompletionRate": goal_rate
        }

    async def generate_csv_export(
        self,
        user_id: str,
        start_date: str | None = None,
        end_date: str | None = None
    ) -> str:
        s_date = start_date or (date.today() - timedelta(days=90)).isoformat()
        e_date = end_date or (date.today() + timedelta(days=90)).isoformat()

        activities = await self.activity_repo.get_all_by_range(user_id, s_date, e_date)

        output = io.StringIO()
        writer = csv.writer(output)

        # Header row
        writer.writerow([
            "Activity ID",
            "Title",
            "Category",
            "Priority",
            "Status",
            "Date",
            "Planned Start Time",
            "Planned End Time",
            "Planned Duration (min)",
            "Actual Duration (min)",
            "Tags",
            "Notes"
        ])

        # Rows with formula injection protection
        for act in activities:
            writer.writerow([
                sanitize_csv_cell(act.get("id")),
                sanitize_csv_cell(act.get("title")),
                sanitize_csv_cell(act.get("category")),
                sanitize_csv_cell(act.get("priority")),
                sanitize_csv_cell(act.get("status")),
                sanitize_csv_cell(act.get("activityDate")),
                sanitize_csv_cell(act.get("plannedStartTime")),
                sanitize_csv_cell(act.get("plannedEndTime")),
                sanitize_csv_cell(act.get("plannedDuration")),
                sanitize_csv_cell(act.get("actualDuration")),
                sanitize_csv_cell(", ".join(act.get("tags", []))),
                sanitize_csv_cell(act.get("notes"))
            ])

        return output.getvalue()
