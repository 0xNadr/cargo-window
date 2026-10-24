"""Briefs: Claude writes the note to the commander and the shippers, from the packer's numbers only."""

from datetime import date

from app.llm import complete
from app.models import Booking, Flight, Manifest, Placement, Plan, Priority, StatusKind, Step
from app.schedule import BASES, FLIGHT_BY_ID, arrival, next_flight

PRIORITY_LABEL = {Priority.LIFE: "Life-critical", Priority.MISSION: "Mission-critical", Priority.COMMERCIAL: "Commercial"}


def fmt_date(d: date) -> str:
    return d.strftime("%d %b %Y").upper()


def fmt_days(n: int) -> str:
    return f"{n} {'day' if n == 1 else 'days'}" if n < 60 else f"{round(n / 30.44)} months"


def status_text(p: Placement) -> str:
    if p.status is StatusKind.LATE:
        return f"Late by {fmt_days(p.gap_days)}" if p.gap_days is not None else "No flight has room"
    spare = -(p.gap_days or 0)
    tail = f"{fmt_days(spare)} spare" if spare > 0 else "no margin"
    return f"Moved, {tail}" if p.status is StatusKind.MOVED else f"On time, {tail}"


def bump_reason(b: Booking, step: Step) -> str:
    if b.mass > step.mass_left:
        return f"needs {b.mass:,} kg, {max(0, step.mass_left):,} kg left"
    return f"needs {b.vol:g} m³, {max(0.0, step.vol_left):g} m³ left"


def brief_facts(flight: Flight, manifest: Manifest, bookings: dict[str, Booking], placements: dict[str, Placement]) -> str:
    base = BASES[flight.dest]
    later = next_flight(flight)
    lines = [
        f"Flight {flight.id}, Earth to {base.name} ({base.body}). Launch {fmt_date(flight.launch)}, arrives {fmt_date(arrival(flight))}.",
        f"Mass used {manifest.mass:,} of {flight.mass_cap:,} kg ({flight.mass_cap - manifest.mass:,} kg free). "
        f"Volume used {manifest.vol:g} of {flight.vol_cap:g} m³.",
        f"Next flight to this base: {later.id}, launches {fmt_date(later.launch)}." if later else "No later flight to this base is scheduled.",
        "",
        "On board:",
    ]
    for booking_id in manifest.loaded:
        b, p = bookings[booking_id], placements[booking_id]
        lines.append(f"- {PRIORITY_LABEL[b.priority]}: {b.item} ({b.shipper}), {b.mass:,} kg, {b.vol:g} m³, "
                     f"needed by {fmt_date(b.needed_by)}. {status_text(p)}.")
    lines += ["", "Bumped from this flight:"]
    if not manifest.bumped:
        lines.append("- none")
    steps = {s.booking_id: s for s in manifest.steps}
    for booking_id in manifest.bumped:
        b, p = bookings[booking_id], placements[booking_id]
        where = f"Now on {p.flight_id}, arrives {fmt_date(p.arrives)}" if p.flight_id and p.arrives else "No later flight has room"
        lines.append(f"- {PRIORITY_LABEL[b.priority]}: {b.item} ({b.shipper}), {b.mass:,} kg, {b.vol:g} m³. "
                     f"Did not fit: {bump_reason(b, steps[booking_id])}. {where}. {status_text(p)}.")
    return "\n".join(lines)


def brief_prompt(facts: str) -> str:
    return f"""You are the cargo desk assistant for Cargo Window, a freight planner for off-world bases in 2035. Write a short brief about one flight's manifest.
Use only the facts below. Do not invent numbers, dates, loads or people. Plain text only: no Markdown, no bold, no headings other than the three labels.

Write for people who are not planners: plain words, no codes or jargon beyond the rocket names.
Write three parts, each starting with its label on its own line:
To the commander of the base
Two or three sentences: what flies, what had to wait for a later rocket, and which late loads matter most for the crew.
To the senders whose cargo moved
One line per load that didn't fit, starting with "- ", naming the sender, the load, the rocket it now goes on and when it lands, and how late it is if it is late. If nothing had to move, say so in one line.
Decisions for the commander
Up to two questions, each starting with "- ", based only on the free capacity and load sizes given. Leave this part out if nothing is late.

Facts:
{facts}"""


async def write_brief(flight_id: str, bookings: list[Booking], plan: Plan) -> str:
    flight = FLIGHT_BY_ID[flight_id]
    manifest = next(m for m in plan.manifests if m.flight_id == flight_id)
    facts = brief_facts(flight, manifest, {b.id: b for b in bookings}, {p.booking_id: p for p in plan.placements})
    return await complete(brief_prompt(facts))
