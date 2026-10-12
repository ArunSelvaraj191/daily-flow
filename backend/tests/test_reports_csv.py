import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_csv_export_formula_injection_prevention(client: AsyncClient, auth_headers: dict):
    # Create an activity with malicious formula injection title
    malicious_title = "=SUM(A1:A10)"
    notes_formula = "@calc|cmd"
    from datetime import date
    today_str = date.today().isoformat()
    await client.post("/api/v1/activities", headers=auth_headers, json={
        "title": malicious_title,
        "notes": notes_formula,
        "category": "Work",
        "priority": "Medium",
        "status": "Pending",
        "activityDate": today_str,
        "plannedDuration": 45
    })

    # Request CSV export
    csv_resp = await client.get("/api/v1/reports/export.csv", headers=auth_headers)
    assert csv_resp.status_code == 200
    assert csv_resp.headers["content-type"].startswith("text/csv")
    csv_text = csv_resp.text

    # Verify that the malicious formulas are sanitized with a leading quote
    assert "'=SUM(A1:A10)" in csv_text
    assert "'@calc|cmd" in csv_text


@pytest.mark.asyncio
async def test_ai_insights_endpoint(client: AsyncClient, auth_headers: dict):
    resp = await client.get("/api/v1/reports/ai-insights", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "summary" in data
    assert "strengths" in data
    assert "actionableSuggestions" in data
    assert "quoteOfTheDay" in data
