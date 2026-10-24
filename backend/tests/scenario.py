"""The demo scenario from the pitch, as API bookings: the seed, the Sabatier request and the two demo events."""

from datetime import date

from app.models import Base, Booking, Priority

_SEED = [
    ("moon", "Electrolysis stack for the oxygen plant", "Shackleton Base Ops", "life", 420, 1.8, "2035-05-20", None),
    ("moon", "Food resupply, 90 days", "Shackleton Base Ops", "life", 1200, 6, "2035-05-30", None),
    ("moon", "Medical resupply kit", "Shackleton Base Ops", "life", 180, 1.2, "2035-06-01", None),
    ("moon", "Radiator panels for the fission power plant", "Helios Power", "mission", 2100, 14, "2035-06-15", None),
    ("moon", "Broadcast camera rig", "Selene Media", "commercial", 120, 0.8, "2035-06-01", 70000),
    ("moon", "Ice drill bits", "Lunar Ice Co.", "commercial", 800, 3, "2035-05-31", 61000),
    ("moon", "Seismometer array", "Lunar Science Consortium", "commercial", 260, 1.5, "2035-07-15", 52000),
    ("moon", "Excavator wheel assemblies", "Regolith Works", "commercial", 1500, 9, "2035-06-30", 48000),
    ("moon", "Guest habitat furniture", "Tranquility Hotels", "commercial", 950, 11, "2035-08-01", 38000),
    ("mars", "Food reserve, 6 crew", "Ares Outpost Ops", "life", 3200, 18, "2036-02-01", None),
    ("mars", "CO₂ scrubber cartridges", "Ares Outpost Ops", "life", 640, 3.5, "2036-03-15", None),
    ("mars", "Water recycler spare assembly", "Ares Outpost Ops", "life", 380, 2, "2036-04-01", None),
    ("mars", "Surgical and pharmacy kit", "Ares Outpost Ops", "life", 210, 1.4, "2036-01-30", None),
    ("mars", "Power controller for the surface reactor", "Helios Power", "mission", 1100, 4, "2036-02-15", None),
    ("mars", "Greenhouse LED panels", "Ares Outpost Ops", "mission", 900, 7, "2036-06-01", None),
    ("mars", "Relay antenna", "Red Planet Relay", "commercial", 450, 4, "2036-09-01", 140000),
    ("mars", "Rover fleet, 4 units", "Red Dust Robotics", "commercial", 1800, 14, "2036-08-01", 120000),
    ("mars", "Drill core lab", "Jezero Survey Consortium", "commercial", 700, 5, "2036-10-01", 85000),
]
SABATIER = ("mars", "Sabatier reactor replacement", "Ares Outpost Ops", "life", 1250, 6, "2036-02-20", None)
GREENHOUSE = ("mars", "Hydroponic grow racks", "Ares Outpost Ops", "mission", 1400, 8, "2036-05-01", None)
CREW_GROWS = ("mars", "Food for two added crew", "Ares Outpost Ops", "life", 1100, 5.5, "2036-02-01", None)


def bookings(*extra: tuple) -> list[Booking]:
    rows = [*_SEED, *extra]
    return [
        Booking(id=f"B{i}", dest=Base(dest), item=item, shipper=shipper, priority=Priority(priority),
                mass=mass, vol=vol, needed_by=date.fromisoformat(needed), bid=bid)
        for i, (dest, item, shipper, priority, mass, vol, needed, bid) in enumerate(rows, start=1)
    ]


STAGES = {
    "start": bookings(),
    "sabatier": bookings(SABATIER),
    "greenhouse": bookings(SABATIER, GREENHOUSE),
    "crew_grows": bookings(SABATIER, GREENHOUSE, CREW_GROWS),
}
