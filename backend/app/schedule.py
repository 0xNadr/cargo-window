"""The flight schedule both copies of the planner share: bases, flights, trip times."""

from dataclasses import dataclass
from datetime import date, timedelta

from app.models import Base, Flight

MISSION_DATE = date(2035, 5, 2)


@dataclass(frozen=True)
class BaseInfo:
    name: str
    body: str
    transit_days: int
    team: str


BASES: dict[Base, BaseInfo] = {
    Base.MOON: BaseInfo("Shackleton Base", "Moon", 4, "Shackleton Base Ops"),
    Base.MARS: BaseInfo("Ares Outpost", "Mars", 205, "Ares Outpost Ops"),
}


def _build_flights() -> tuple[Flight, ...]:
    flights: list[Flight] = []
    launch, number = date(2035, 5, 9), 14
    while launch <= date(2038, 4, 20):
        flights.append(Flight(id=f"LN-{number}", dest=Base.MOON, launch=launch, mass_cap=6000, vol_cap=40))
        launch += timedelta(days=28)
        number += 1
    # Mars launch windows are about 26 months apart.
    flights.append(Flight(id="MS-07", dest=Base.MARS, launch=date(2035, 6, 24), mass_cap=9500, vol_cap=62))
    flights.append(Flight(id="MS-08", dest=Base.MARS, launch=date(2037, 8, 20), mass_cap=9500, vol_cap=62))
    return tuple(flights)


FLIGHTS = _build_flights()
FLIGHT_BY_ID = {f.id: f for f in FLIGHTS}


def flights_for(base: Base) -> list[Flight]:
    return [f for f in FLIGHTS if f.dest is base]


def arrival(flight: Flight) -> date:
    return flight.launch + timedelta(days=BASES[flight.dest].transit_days)


def next_flight(flight: Flight) -> Flight | None:
    later = flights_for(flight.dest)
    index = later.index(flight)
    return later[index + 1] if index + 1 < len(later) else None
