"""API and domain models. Dates are calendar days in UTC; masses are kg, volumes m³, bids $/kg."""

from datetime import date
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field, model_validator


class Base(StrEnum):
    MOON = "moon"
    MARS = "mars"


class Priority(StrEnum):
    LIFE = "life"
    MISSION = "mission"
    COMMERCIAL = "commercial"


class StatusKind(StrEnum):
    OK = "ok"
    MOVED = "moved"
    LATE = "late"


class Flight(BaseModel):
    model_config = ConfigDict(frozen=True)

    id: str
    dest: Base
    launch: date
    mass_cap: int
    vol_cap: float


class Booking(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str = Field(min_length=1, max_length=40)
    dest: Base
    item: str = Field(min_length=1, max_length=120)
    shipper: str = Field(min_length=1, max_length=80)
    priority: Priority
    mass: int = Field(gt=0, le=1_000_000)
    vol: float = Field(gt=0, le=10_000)
    needed_by: date
    bid: int | None = Field(default=None, gt=0)


class Step(BaseModel):
    booking_id: str
    fits: bool
    mass_left: int
    vol_left: float
    mass_after: int


class Manifest(BaseModel):
    flight_id: str
    loaded: list[str]
    bumped: list[str]
    steps: list[Step]
    mass: int
    vol: float
    fingerprint: str


class Placement(BaseModel):
    booking_id: str
    flight_id: str | None
    bumped_from: list[str]
    status: StatusKind
    arrives: date | None
    gap_days: int | None = Field(description="Days after the need date it arrives; negative means days to spare.")


class Plan(BaseModel):
    manifests: list[Manifest]
    placements: list[Placement]
    days_short: int = Field(description="Days late, summed over late life- and mission-critical loads.")


class PlanRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    bookings: list[Booking] = Field(max_length=500)

    @model_validator(mode="after")
    def ids_are_unique(self) -> "PlanRequest":
        ids = [b.id for b in self.bookings]
        if len(ids) != len(set(ids)):
            raise ValueError("booking ids must be unique")
        return self


class IntakeRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    text: str = Field(min_length=1, max_length=4000)


class Draft(BaseModel):
    item: str
    shipper: str
    destination: Base | None
    priority: Priority
    priority_reason: str
    mass_kg: int | None
    volume_m3: float | None
    needed_by: date | None
    bid_usd_per_kg: int | None
    questions: list[str]


class BriefRequest(PlanRequest):
    flight_id: str


class Brief(BaseModel):
    text: str


class Health(BaseModel):
    ai: bool
    model: str | None
