"""Cargo Window API. Serves the planner, the Claude-backed request desk and briefs, and the built web app."""

import os
import time
from collections import defaultdict, deque
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.briefs import write_brief
from app.intake import read_request
from app.llm import MODEL, AIUnavailable, ai_enabled
from app.models import Brief, BriefRequest, Draft, Health, IntakeRequest, Plan, PlanRequest
from app.packer import pack
from app.schedule import FLIGHT_BY_ID

# The Next.js static export (`npm run build` in web/). When it hasn't been built, only the API is served.
FRONTEND_DIR = Path(os.environ.get("CARGO_WINDOW_WEB_DIR", Path(__file__).resolve().parents[2] / "web" / "out"))
AI_CALLS_PER_MINUTE = int(os.environ.get("CARGO_WINDOW_AI_PER_MINUTE", "20"))

app = FastAPI(title="Cargo Window", version="1.0.0")

if origins := os.environ.get("CORS_ORIGINS"):
    app.add_middleware(CORSMiddleware, allow_origins=origins.split(","), allow_methods=["GET", "POST"], allow_headers=["Content-Type"])

_ai_calls: dict[str, deque[float]] = defaultdict(deque)


def _limit_ai(request: Request) -> None:
    """Every AI call spends money on the server's key, so each client gets a small budget per minute."""
    key = request.client.host if request.client else "unknown"
    now = time.monotonic()
    calls = _ai_calls[key]
    while calls and now - calls[0] > 60:
        calls.popleft()
    if len(calls) >= AI_CALLS_PER_MINUTE:
        raise HTTPException(status_code=429, detail="rate_limited")
    calls.append(now)


@app.get("/api/health")
async def health() -> Health:
    return Health(ai=ai_enabled(), model=MODEL if ai_enabled() else None)


@app.post("/api/plan")
async def plan(body: PlanRequest) -> Plan:
    return pack(body.bookings)


@app.post("/api/intake")
async def intake(body: IntakeRequest, request: Request) -> Draft:
    _limit_ai(request)
    try:
        return await read_request(body.text)
    except AIUnavailable as e:
        raise HTTPException(status_code=503, detail=str(e)) from e


@app.post("/api/brief")
async def brief(body: BriefRequest, request: Request) -> Brief:
    if body.flight_id not in FLIGHT_BY_ID:
        raise HTTPException(status_code=404, detail="unknown_flight")
    _limit_ai(request)
    try:
        return Brief(text=await write_brief(body.flight_id, body.bookings, pack(body.bookings)))
    except AIUnavailable as e:
        raise HTTPException(status_code=503, detail=str(e)) from e


if FRONTEND_DIR.is_dir():
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
