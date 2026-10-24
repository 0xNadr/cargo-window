import { d, type BaseId, type Booking, type Priority } from "@/lib/engine";

// [base, load, shipper, priority, kg, m³, needed by, bid $/kg]
export type BookingRow = [BaseId, string, string, Priority, number, number, string, number?];

const SEED: BookingRow[] = [
  ["moon", "Electrolysis stack for the oxygen plant", "Shackleton Base Ops", "life", 420, 1.8, "2035-05-20"],
  ["moon", "Food resupply, 90 days", "Shackleton Base Ops", "life", 1200, 6, "2035-05-30"],
  ["moon", "Medical resupply kit", "Shackleton Base Ops", "life", 180, 1.2, "2035-06-01"],
  ["moon", "Radiator panels for the fission power plant", "Helios Power", "mission", 2100, 14, "2035-06-15"],
  ["moon", "Broadcast camera rig", "Selene Media", "commercial", 120, 0.8, "2035-06-01", 70000],
  ["moon", "Ice drill bits", "Lunar Ice Co.", "commercial", 800, 3, "2035-05-31", 61000],
  ["moon", "Seismometer array", "Lunar Science Consortium", "commercial", 260, 1.5, "2035-07-15", 52000],
  ["moon", "Excavator wheel assemblies", "Regolith Works", "commercial", 1500, 9, "2035-06-30", 48000],
  ["moon", "Guest habitat furniture", "Tranquility Hotels", "commercial", 950, 11, "2035-08-01", 38000],
  ["mars", "Food reserve, 6 crew", "Ares Outpost Ops", "life", 3200, 18, "2036-02-01"],
  ["mars", "CO₂ scrubber cartridges", "Ares Outpost Ops", "life", 640, 3.5, "2036-03-15"],
  ["mars", "Water recycler spare assembly", "Ares Outpost Ops", "life", 380, 2, "2036-04-01"],
  ["mars", "Surgical and pharmacy kit", "Ares Outpost Ops", "life", 210, 1.4, "2036-01-30"],
  ["mars", "Power controller for the surface reactor", "Helios Power", "mission", 1100, 4, "2036-02-15"],
  ["mars", "Greenhouse LED panels", "Ares Outpost Ops", "mission", 900, 7, "2036-06-01"],
  ["mars", "Relay antenna", "Red Planet Relay", "commercial", 450, 4, "2036-09-01", 140000],
  ["mars", "Rover fleet, 4 units", "Red Dust Robotics", "commercial", 1800, 14, "2036-08-01", 120000],
  ["mars", "Drill core lab", "Jezero Survey Consortium", "commercial", 700, 5, "2036-10-01", 85000],
];

export const toBooking = ([dest, item, shipper, priority, mass, vol, needed, bid]: BookingRow, id: string): Booking => ({
  id, dest, item, shipper, priority, mass, vol, neededBy: d(needed), bid: bid ?? null,
});

export const seedBookings = (): Booking[] => SEED.map((row, i) => toBooking(row, `B${i + 1}`));
export const SEED_COUNT = SEED.length;

export interface DemoEvent {
  title: string;
  detail: string;
  add: BookingRow;
}

export const EVENTS: DemoEvent[] = [
  {
    title: "Greenhouse expansion approved",
    detail: "Ares Outpost needs hydroponic racks: mission-critical, 1,400 kg.",
    add: ["mars", "Hydroponic grow racks", "Ares Outpost Ops", "mission", 1400, 8, "2036-05-01"],
  },
  {
    title: "Crew grows from 6 to 8",
    detail: "Two more people need food until the next window: life-critical, 1,100 kg.",
    add: ["mars", "Food for two added crew", "Ares Outpost Ops", "life", 1100, 5.5, "2036-02-01"],
  },
];

export const REQUESTS = [
  {
    label: "Ares: Sabatier reactor failing",
    text: "ARES OUTPOST TO CARGO DESK, SOL 112.\nSabatier reactor B tripped twice overnight and now runs at 40% output. We need a replacement Sabatier reactor on the next ship. Crated it is about 1.25 tonnes and 6 m³. With reactor A alone our oxygen reserve covers 294 days.\nCmdr. Okafor",
  },
  {
    label: "Shackleton: medicine",
    text: "Shackleton Base medical officer here. One of the crew needs a course of antiviral medication and our stock runs out in 12 days. The package is small, 35 kg and 0.2 cubic metres.",
  },
  {
    label: "Kepler Mining: drill",
    text: "Hi, this is Kepler Mining. We'd like to ship an ice prospecting drill to Ares Outpost on the June flight. Our bid is $95,000 per kg. It has to be on site before drilling season starts on 1 June 2036.",
  },
];
