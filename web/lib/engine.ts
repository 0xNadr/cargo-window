// The packing rules, as the base copy. backend/app/packer.py is the Earth copy; both must pack identically,
// which backend/tests/test_parity.py checks by running this file in Node. Keep it import-free and use only
// TypeScript syntax that type stripping can erase (no enums, no parameter properties).

export type BaseId = "moon" | "mars";
export type Priority = "life" | "mission" | "commercial";
export type StatusKind = "ok" | "moved" | "late";

export interface Booking {
  id: string;
  dest: BaseId;
  item: string;
  shipper: string;
  priority: Priority;
  mass: number;
  vol: number;
  neededBy: number;
  bid: number | null;
}

export interface Flight {
  id: string;
  dest: BaseId;
  launch: number;
  massCap: number;
  volCap: number;
}

export interface Step {
  booking: Booking;
  fits: boolean;
  massLeft: number;
  volLeft: number;
  massAfter: number;
}

export interface Manifest {
  flight: Flight;
  loaded: Booking[];
  bumped: Booking[];
  steps: Step[];
  mass: number;
  vol: number;
}

export interface Placement {
  flight: Flight | null;
  bumpedFrom: Flight[];
}

export interface Plan {
  manifests: Map<string, Manifest>;
  placements: Map<string, Placement>;
}

export interface Status {
  kind: StatusKind;
  flight: Flight | null;
  arrive: number | null;
  gap: number | null;
}

export const DAY = 864e5;
export const d = (iso: string): number => Date.parse(iso + "T00:00:00Z");
export const isoDate = (t: number): string => new Date(t).toISOString().slice(0, 10);
export const MISSION_DATE = d("2035-05-02");

export const BASES: Record<BaseId, { name: string; body: string; transitDays: number; team: string }> = {
  moon: { name: "Shackleton Base", body: "Moon", transitDays: 4, team: "Shackleton Base Ops" },
  mars: { name: "Ares Outpost", body: "Mars", transitDays: 205, team: "Ares Outpost Ops" },
};

export const PRIORITY: Record<Priority, { rank: number; code: string; label: string }> = {
  life: { rank: 0, code: "P1", label: "Life-critical" },
  mission: { rank: 1, code: "P2", label: "Mission-critical" },
  commercial: { rank: 2, code: "P3", label: "Commercial" },
};

function buildFlights(): Flight[] {
  const list: Flight[] = [];
  for (let t = d("2035-05-09"), n = 14; t <= d("2038-04-20"); t += 28 * DAY, n++) {
    list.push({ id: `LN-${n}`, dest: "moon", launch: t, massCap: 6000, volCap: 40 });
  }
  // Mars launch windows are about 26 months apart.
  list.push({ id: "MS-07", dest: "mars", launch: d("2035-06-24"), massCap: 9500, volCap: 62 });
  list.push({ id: "MS-08", dest: "mars", launch: d("2037-08-20"), massCap: 9500, volCap: 62 });
  return list;
}

export const FLIGHTS = buildFlights();
export const flightById = new Map(FLIGHTS.map((f) => [f.id, f]));
export const flightsFor = (dest: BaseId): Flight[] => FLIGHTS.filter((f) => f.dest === dest);
export const arrival = (f: Flight): number => f.launch + BASES[f.dest].transitDays * DAY;

export function nextFlight(f: Flight): Flight | null {
  const list = flightsFor(f.dest);
  return list[list.indexOf(f) + 1] ?? null;
}

export const round1 = (n: number): number => Math.round(n * 10) / 10;

// Class first; inside life and mission the earliest need, inside commercial the highest bid.
function packOrder(a: Booking, b: Booking): number {
  const r = PRIORITY[a.priority].rank - PRIORITY[b.priority].rank;
  if (r) return r;
  if (a.priority === "commercial" && a.bid !== b.bid) return (b.bid ?? 0) - (a.bid ?? 0);
  return a.neededBy - b.neededBy;
}

export function pack(bookings: Booking[]): Plan {
  const manifests = new Map<string, Manifest>();
  const placements = new Map<string, Placement>();
  for (const dest of Object.keys(BASES) as BaseId[]) {
    let waiting = bookings.filter((b) => b.dest === dest);
    const bumpedFrom = new Map<string, Flight[]>(waiting.map((b) => [b.id, []]));
    for (const f of flightsFor(dest)) {
      const m: Manifest = { flight: f, loaded: [], bumped: [], steps: [], mass: 0, vol: 0 };
      for (const b of [...waiting].sort(packOrder)) {
        const fits = m.mass + b.mass <= f.massCap && round1(m.vol + b.vol) <= f.volCap;
        const massLeft = f.massCap - m.mass;
        const volLeft = round1(f.volCap - m.vol);
        if (fits) {
          m.loaded.push(b);
          m.mass += b.mass;
          m.vol = round1(m.vol + b.vol);
          placements.set(b.id, { flight: f, bumpedFrom: bumpedFrom.get(b.id)! });
        } else {
          m.bumped.push(b);
          bumpedFrom.get(b.id)!.push(f);
        }
        m.steps.push({ booking: b, fits, massLeft, volLeft, massAfter: m.mass });
      }
      waiting = m.bumped;
      manifests.set(f.id, m);
    }
    for (const b of waiting) placements.set(b.id, { flight: null, bumpedFrom: bumpedFrom.get(b.id)! });
  }
  return { manifests, placements };
}

export function statusOf(b: Booking, plan: Plan): Status {
  const p = plan.placements.get(b.id)!;
  if (!p.flight) return { kind: "late", flight: null, arrive: null, gap: null };
  const arrive = arrival(p.flight);
  const gap = Math.round((arrive - b.neededBy) / DAY);
  if (gap > 0) return { kind: "late", flight: p.flight, arrive, gap };
  return { kind: p.bumpedFrom.length ? "moved" : "ok", flight: p.flight, arrive, gap };
}

// Days a base goes without: lateness summed over the loads the crew or the base depends on.
export function daysShort(bookings: Booking[], plan: Plan): number {
  return bookings
    .filter((b) => b.priority !== "commercial")
    .map((b) => statusOf(b, plan))
    .reduce((sum, s) => sum + (s.kind === "late" && s.flight ? s.gap! : 0), 0);
}

// FNV-1a over the flight and its loads in packing order: same bookings, same code, on any copy.
export function fingerprint(m: Manifest): string {
  const s = [m.flight.id, ...m.loaded.map((b) => [b.item, b.shipper, b.priority, b.mass, b.vol, isoDate(b.neededBy), b.bid ?? ""].join("|"))].join("\n");
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  const hex = h.toString(16).toUpperCase().padStart(8, "0");
  return `${hex.slice(0, 4)}·${hex.slice(4)}`;
}
