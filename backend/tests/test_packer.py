from app.models import Priority, StatusKind
from app.packer import fingerprint, pack, round1
from tests.scenario import STAGES


def _status(plan, item_prefix, bookings):
    booking = next(b for b in bookings if b.item.startswith(item_prefix))
    return next(p for p in plan.placements if p.booking_id == booking.id)


def test_seed_scenario_has_nothing_late():
    plan = pack(STAGES["start"])
    assert all(p.status is not StatusKind.LATE for p in plan.placements)
    assert plan.days_short == 0


def test_moon_bumps_cost_four_weeks_and_stay_on_time():
    bookings = STAGES["start"]
    plan = pack(bookings)
    furniture = _status(plan, "Guest habitat furniture", bookings)
    assert furniture.bumped_from == ["LN-14"]
    assert furniture.flight_id == "LN-15"
    assert furniture.status is StatusKind.MOVED


def test_sabatier_request_bumps_the_rover_fleet_to_the_next_window():
    bookings = STAGES["sabatier"]
    plan = pack(bookings)
    rover = _status(plan, "Rover fleet", bookings)
    assert rover.flight_id == "MS-08"
    assert rover.status is StatusKind.LATE
    assert rover.gap_days == 589
    assert _status(plan, "Sabatier", bookings).flight_id == "MS-07"


def test_money_gives_way_before_survival():
    plan = pack(STAGES["greenhouse"])
    assert plan.days_short == 0


def test_crew_growth_makes_the_base_go_short():
    bookings = STAGES["crew_grows"]
    plan = pack(bookings)
    leds = _status(plan, "Greenhouse LED panels", bookings)
    assert leds.status is StatusKind.LATE
    assert plan.days_short == 650


def test_life_critical_loads_are_never_bumped_in_the_demo():
    for bookings in STAGES.values():
        plan = pack(bookings)
        life = {b.id for b in bookings if b.priority is Priority.LIFE}
        assert all(not p.bumped_from for p in plan.placements if p.booking_id in life)


def test_fingerprint_depends_on_the_manifest():
    bookings = STAGES["start"]
    loaded = bookings[:3]
    assert fingerprint("LN-14", loaded) == fingerprint("LN-14", list(loaded))
    assert fingerprint("LN-14", loaded) != fingerprint("LN-14", loaded[:2])
    assert fingerprint("LN-14", loaded) != fingerprint("LN-15", loaded)


def test_round1_rounds_halves_up_like_the_browser():
    assert round1(0.25) == 0.3
    assert round1(1.8 + 6) == 7.8
