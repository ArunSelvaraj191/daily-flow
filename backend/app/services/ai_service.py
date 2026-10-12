from datetime import date
from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.repositories.activity_repository import ActivityRepository
from app.repositories.goal_repository import GoalRepository
from app.repositories.habit_repository import HabitRepository


class AIService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.activity_repo = ActivityRepository(db)
        self.habit_repo = HabitRepository(db)
        self.goal_repo = GoalRepository(db)

    async def generate_productivity_insights(self, user_id: str) -> dict[str, Any]:
        today_str = date.today().isoformat()
        
        # Pull real activities for today
        activities, _ = await self.activity_repo.list_activities(
            user_id=user_id,
            date=today_str,
            page_size=100
        )
        completed = [a for a in activities if a.get("status") == "Completed"]
        total_count = len(activities)
        completed_count = len(completed)
        tracked_minutes = sum(a.get("actualDuration", 0) for a in activities)
        
        habits = await self.habit_repo.list_habits(user_id, active_only=True)
        completed_habits_today = sum(1 for h in habits if h.get("completedToday"))
        max_streak = max([h.get("currentStreak", 0) for h in habits], default=0)

        goals = await self.goal_repo.list_goals(user_id)
        
        # Build grounded summary
        summary = (
            f"You completed {completed_count} of your {total_count} planned activities today. "
            f"Your recorded productive time was {tracked_minutes} minutes ({round(tracked_minutes/60.0, 1)} hours)."
        )
        if total_count > completed_count:
            diff = total_count - completed_count
            summary += f" Consider reviewing your {diff} pending activity{'ies' if diff > 1 else ''} before tomorrow's plan."

        strengths = []
        if completed_count > 0:
            strengths.append(f"Successfully finished {completed_count} task(s) on schedule.")
        if completed_habits_today > 0:
            strengths.append(f"Completed {completed_habits_today} recurring habit(s) today.")
        if tracked_minutes >= 120:
            strengths.append(f"Strong deep work volume with {tracked_minutes} minutes logged.")
        if max_streak > 0:
            strengths.append(f"Active habit streak maintained at {max_streak} day(s).")
        if not strengths:
            strengths.append("Day is just getting started—ready for focused execution!")

        areas_for_improvement = []
        if total_count > completed_count:
            areas_for_improvement.append("Prioritize the highest-impact unfinished items first thing tomorrow.")
        if tracked_minutes < 60 and total_count > 0:
            areas_for_improvement.append("Remember to run the session timer during work blocks to accurately track actual vs planned time.")
        if any(g.get("isOverdue") for g in goals):
            areas_for_improvement.append("One or more goals need attention to stay on track before the deadline.")
        if not areas_for_improvement:
            areas_for_improvement.append("Maintain your current rhythm and ensure adequate breaks between focus blocks.")

        suggestions = [
            "Group similar tasks into 45-minute focus intervals using the DailyFlow active timer.",
            "Complete your highest-priority urgent tasks during your peak morning energy window.",
            "Review your weekly productivity distribution to ensure high-priority goals get adequate focus."
        ]

        quotes = [
            "“Small daily improvements over time lead to stunning results.” — Robin Sharma",
            "“Focus is a muscle; the more you exercise it, the stronger it gets.”",
            "“Productivity is being able to do things that you were never able to do before.” — Franz Kafka"
        ]
        quote = quotes[hash(today_str) % len(quotes)]

        return {
            "summary": summary,
            "strengths": strengths,
            "areasForImprovement": areas_for_improvement,
            "actionableSuggestions": suggestions,
            "quoteOfTheDay": quote
        }
