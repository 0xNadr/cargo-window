"""The packing rules. This is the Earth copy; frontend/index.html carries the same rules as the base copy.

Both copies must produce the same manifests for the same bookings, which the fingerprint lets two
sides confirm over a slow link. tests/test_parity.py runs both and compares them.
"""

import math
from datetime import date

from app.models import Base, Booking, Flight, Manifest, Placement, Plan, Priority, StatusKind, Step
from app.schedule import arrival, flights_for

PRIORITY_RANK = {Priority.LIFE: 0, Priority.MISSION: 1, Priority.COMMERCIAL: 2}


def round1(x: float) -> float:
    """Round to one decimal, halves up, as the browser's Math.round does."""
    return math.floor(x * 10 + 0.5) / 10


def _pack_order(b: Booking) -> tuple[int, int, int]:
    """Class first; inside life and mission the earliest need, inside commercial the highest bid."""
    bid_order = -(b.bid or 0) if b.priority is Priority.COMMERCIAL else 0
    return PRIORITY_RANK[b.priority], bid_order, b.needed_by.toordinal()


def _js_number(x: float) -> str:
    return str(int(x)) if float(x).is_integer() else repr(float(x))


def fingerprint(flight_id: str, loaded: list[Booking]) -> str:
    """FNV-1a over the flight and its loads in packing order, hashed per UTF-16 unit like the browser."""
    lines = [flight_id] + [
        "|".join([b.item, b.shipper, b.priority.value, _js_number(b.mass), _js_number(b.vol),
                  b.needed_by.isoformat(), "" if b.bid is None else _js_number(b.bid)])
        for b in loaded
    ]
    data = "\n".join(lines).encode("utf-16-le")
    h = 0x811C9DC5
    for i in range(0, len(data), 2):
        h ^= data[i] | (data[i + 1] << 8)
        h = (h * 0x01000193) & 0xFFFFFFFF
    code = f"{h:08X}"
    return f"{code[:4]}·{code[4:]}"


def _placement(b: Booking, flight: Flight | None, bumped_from: list[str]) -> Placement:
    if flight is None:
        return Placement(booking_id=b.id, flight_id=None, bumped_from=bumped_from,
                         status=StatusKind.LATE, arrives=None, gap_days=None)
    arrives: date = arrival(flight)
    gap = (arrives - b.needed_by).days
    status = StatusKind.LATE if gap > 0 else StatusKind.MOVED if bumped_from else StatusKind.OK
    return Placement(booking_id=b.id, flight_id=flight.id, bumped_from=bumped_from,
                     status=status, arrives=arrives, gap_days=gap)


def pack(bookings: list[Booking]) -> Plan:
    manifests: list[Manifest] = []
    placed: dict[str, tuple[Flight | None, list[str]]] = {}
    for base in Base:
        waiting = [b for b in bookings if b.dest is base]
        bumped_from: dict[str, list[str]] = {b.id: [] for b in waiting}
        for flight in flights_for(base):
            loaded: list[Booking] = []
            bumped: list[Booking] = []
            steps: list[Step] = []
            mass, vol = 0, 0.0
            for b in sorted(waiting, key=_pack_order):
                fits = mass + b.mass <= flight.mass_cap and round1(vol + b.vol) <= flight.vol_cap
                mass_left, vol_left = flight.mass_cap - mass, round1(flight.vol_cap - vol)
                if fits:
                    loaded.append(b)
                    mass += b.mass
                    vol = round1(vol + b.vol)
                    placed[b.id] = (flight, bumped_from[b.id])
                else:
                    bumped.append(b)
                    bumped_from[b.id].append(flight.id)
                steps.append(Step(booking_id=b.id, fits=fits, mass_left=mass_left, vol_left=vol_left, mass_after=mass))
            manifests.append(Manifest(flight_id=flight.id, loaded=[b.id for b in loaded], bumped=[b.id for b in bumped],
                                      steps=steps, mass=mass, vol=vol, fingerprint=fingerprint(flight.id, loaded)))
            waiting = bumped
        for b in waiting:
            placed[b.id] = (None, bumped_from[b.id])

    placements = [_placement(b, *placed[b.id]) for b in bookings]
    priority_of = {b.id: b.priority for b in bookings}
    days_short = sum(
        p.gap_days for p in placements
        if p.status is StatusKind.LATE and p.gap_days is not None and priority_of[p.booking_id] is not Priority.COMMERCIAL
    )
    return Plan(manifests=manifests, placements=placements, days_short=days_short)
