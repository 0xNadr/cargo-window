// Plain-language summaries of the plan: the status line, each base's state, and what a change did.

import { BASES, flightsFor, statusOf, type BaseId, type Booking, type Plan } from "@/lib/engine";
import { dur } from "@/lib/format";

export type Tone = "good" | "warn" | "bad";

export interface BaseSummary {
  base: BaseId;
  late: Booking[];
  lateEssential: Booking[];
  daysShort: number;
  tone: Tone;
}

export function summarizeBase(base: BaseId, bookings: Booking[], plan: Plan): BaseSummary {
  const mine = bookings.filter((b) => b.dest === base);
  const late = mine.filter((b) => statusOf(b, plan).kind === "late");
  const lateEssential = late.filter((b) => b.priority !== "commercial");
  const daysShort = lateEssential.reduce((sum, b) => sum + (statusOf(b, plan).gap ?? 0), 0);
  return { base, late, lateEssential, daysShort, tone: lateEssential.length ? "bad" : late.length ? "warn" : "good" };
}

export interface Headline {
  tone: Tone;
  title: string;
  detail: string;
  focus: BaseId | null;
}

export function headline(bookings: Booking[], plan: Plan): Headline {
  const bases = (Object.keys(BASES) as BaseId[]).map((b) => summarizeBase(b, bookings, plan));
  const worst = bases.find((s) => s.tone === "bad") ?? bases.find((s) => s.tone === "warn");
  if (!worst) {
    const moved = bookings.filter((b) => statusOf(b, plan).kind === "moved").length;
    return {
      tone: "good",
      title: "Every load arrives before its base needs it.",
      detail: `${bookings.length} loads are booked.${moved ? ` ${moved} had to move to a later rocket but still arrive in time.` : ""} Open the inbox to handle new requests.`,
      focus: null,
    };
  }
  const name = BASES[worst.base].name;
  if (worst.tone === "bad") {
    const first = worst.lateEssential[0];
    return {
      tone: "bad",
      title: `${name} will go short: ${worst.lateEssential.length} essential ${worst.lateEssential.length === 1 ? "load arrives" : "loads arrive"} late.`,
      detail: `That adds up to ${worst.daysShort.toLocaleString("en-US")} days without supplies the base depends on. The worst: ${first.item}, ${dur(statusOf(first, plan).gap!)} late.`,
      focus: worst.base,
    };
  }
  const first = worst.late[0];
  return {
    tone: "warn",
    title: `${worst.late.length} paid ${worst.late.length === 1 ? "load" : "loads"} to ${name} will arrive late.`,
    detail: `The base itself has everything it needs. ${first.item} from ${first.shipper} is the first affected, ${dur(statusOf(first, plan).gap!)} late.`,
    focus: worst.base,
  };
}

export interface ChangeLine {
  tone: Tone;
  text: string;
}

/** What changed for the loads that were already booked, after a change to the plan. */
export function knockOnEffects(before: Plan, after: Plan, bookings: Booking[], skip: Set<string>): ChangeLine[] {
  const lines: ChangeLine[] = [];
  for (const b of bookings) {
    if (skip.has(b.id) || !before.placements.has(b.id)) continue;
    const was = statusOf(b, before);
    const now = statusOf(b, after);
    if (was.flight?.id === now.flight?.id) continue;
    const where = now.flight ? now.flight.id : "no rocket with room";
    if (now.kind === "late") lines.push({ tone: b.priority === "commercial" ? "warn" : "bad", text: `${b.item} (${b.shipper}) moves to ${where} and arrives ${dur(now.gap!)} late.` });
    else lines.push({ tone: "good", text: `${b.item} (${b.shipper}) moves to ${where} and still arrives in time.` });
  }
  return lines;
}

/** Where a new load ended up, in one sentence. */
export function placementLine(b: Booking, plan: Plan): ChangeLine {
  const st = statusOf(b, plan);
  if (!st.flight) return { tone: "bad", text: `No rocket to ${BASES[b.dest].name} has room for it.` };
  if (st.kind === "late") return { tone: "bad", text: `It flies on ${st.flight.id} but arrives ${dur(st.gap!)} after it's needed.` };
  return { tone: "good", text: `It flies on ${st.flight.id} and arrives in time.` };
}

export const nextFlightOf = (base: BaseId) => flightsFor(base)[0];
