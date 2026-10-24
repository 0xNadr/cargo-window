import json

import pytest
from fastapi.testclient import TestClient

from app import briefs, intake, main
from app.intake import normalize
from app.llm import AIUnavailable
from app.models import Base, Priority
from app.schedule import FLIGHTS
from tests.scenario import STAGES

client = TestClient(main.app)


def _payload(stage: str = "start") -> list[dict]:
    return [b.model_dump(mode="json") for b in STAGES[stage]]


@pytest.fixture(autouse=True)
def no_api_key(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    main._ai_calls.clear()


def test_health_reports_no_ai_without_a_key():
    assert client.get("/api/health").json() == {"ai": False, "model": None}


def test_plan_returns_a_manifest_for_every_flight():
    plan = client.post("/api/plan", json={"bookings": _payload("sabatier")}).json()
    assert len(plan["manifests"]) == len(FLIGHTS)
    assert plan["days_short"] == 0


def test_plan_rejects_duplicate_booking_ids():
    rows = _payload()
    rows[1]["id"] = rows[0]["id"]
    assert client.post("/api/plan", json={"bookings": rows}).status_code == 422


def test_intake_without_a_key_tells_the_browser_to_fall_back():
    response = client.post("/api/intake", json={"text": "We need oxygen."})
    assert response.status_code == 503
    assert response.json()["detail"] == "no_api_key"


def test_intake_checks_every_field_claude_returns(monkeypatch):
    async def fake_complete(prompt, *, schema=None, max_tokens=8000):
        assert schema is not None and "Today is 2035-05-02" in prompt
        return json.dumps({
            "item": "Replacement Sabatier reactor", "shipper": "", "destination": "mars", "priority": "life",
            "priority_reason": "It makes oxygen.", "mass_kg": 1250, "volume_m3": 6, "needed_by": "2036-02-20",
            "bid_usd_per_kg": 0, "questions": [],
        })

    monkeypatch.setattr(intake, "complete", fake_complete)
    draft = client.post("/api/intake", json={"text": "Sabatier reactor B failing"}).json()
    assert draft["shipper"] == "Ares Outpost Ops"
    assert draft["needed_by"] == "2036-02-20"
    assert draft["bid_usd_per_kg"] is None
    assert draft["questions"] == []


def test_invalid_values_become_missing_and_turn_into_questions():
    draft = normalize({
        "item": "Ice prospecting drill", "shipper": "Kepler Mining", "destination": "mars", "priority": "commercial",
        "priority_reason": "", "mass_kg": 0, "volume_m3": -3, "needed_by": "2030-01-01", "bid_usd_per_kg": 95000,
        "questions": [],
    })
    assert (draft.mass_kg, draft.volume_m3, draft.needed_by) == (None, None, None)
    assert draft.destination is Base.MARS and draft.priority is Priority.COMMERCIAL
    assert len(draft.questions) == 3


def test_unknown_values_from_claude_never_raise():
    draft = normalize({"destination": "venus", "priority": "urgent", "questions": "not a list"})
    assert draft.destination is None
    assert draft.priority is Priority.COMMERCIAL


def test_brief_uses_only_the_packers_facts(monkeypatch):
    seen = {}

    async def fake_complete(prompt, *, schema=None, max_tokens=8000):
        seen["prompt"] = prompt
        return "FOR THE BASE COMMANDER\nAll good."

    monkeypatch.setattr(briefs, "complete", fake_complete)
    response = client.post("/api/brief", json={"bookings": _payload("sabatier"), "flight_id": "MS-07"})
    assert response.json() == {"text": "FOR THE BASE COMMANDER\nAll good."}
    assert "Rover fleet, 4 units (Red Dust Robotics)" in seen["prompt"]
    assert "Now on MS-08" in seen["prompt"]


def test_brief_for_an_unknown_flight_is_404():
    response = client.post("/api/brief", json={"bookings": _payload(), "flight_id": "XX-01"})
    assert response.status_code == 404


def test_ai_calls_are_rate_limited(monkeypatch):
    async def unavailable(*args, **kwargs):
        raise AIUnavailable("no_api_key")

    monkeypatch.setattr(intake, "complete", unavailable)
    monkeypatch.setattr(main, "AI_CALLS_PER_MINUTE", 2)
    codes = [client.post("/api/intake", json={"text": "hi"}).status_code for _ in range(3)]
    assert codes == [503, 503, 429]


@pytest.mark.skipif(not main.FRONTEND_DIR.is_dir(), reason="the web app has not been built (npm run build in web/)")
def test_built_web_app_is_served():
    for path in ["/", "/console/", "/admin/deck/"]:
        page = client.get(path)
        assert page.status_code == 200, path
        assert "<title>" in page.text and "Cargo Window" in page.text
