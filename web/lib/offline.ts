// What the base copy does without Claude: read requests with simple patterns and write briefs from a template.

import { BASES, DAY, MISSION_DATE, d, isoDate, round1, statusOf, type BaseId, type Manifest, type Plan, type Priority } from "@/lib/engine";
import { dur, fmtDay, num } from "@/lib/format";

export interface Draft {
  item: string;
  shipper: string;
  destination: BaseId | null;
  priority: Priority;
  priority_reason: string;
  mass_kg: number | null;
  volume_m3: number | null;
  needed_by: string | null;
  bid_usd_per_kg: number | null;
  questions: string[];
}

const MONTH_NAMES = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

export const QUESTION_FOR: Record<string, string> = {
  "the destination": "Which base is it for, Shackleton Base or Ares Outpost?",
  "the mass": "What is the packed mass in kilograms?",
  "the volume": "How much space does it take up, in cubic metres?",
  "the need date": "By what date must it be at the base?",
  "the bid": "What do you bid per kilogram?",
};

export function missingFields(x: Draft): string[] {
  const out: string[] = [];
  if (!x.destination) out.push("the destination");
  if (x.mass_kg == null) out.push("the mass");
  if (x.volume_m3 == null) out.push("the volume");
  if (x.needed_by == null) out.push("the need date");
  if (x.priority === "commercial" && x.bid_usd_per_kg == null) out.push("the bid");
  return out;
}

const positive = (v: unknown): number | null => {
  const n = typeof v === "string" ? Number(v.replace(/,/g, "")) : v;
  return typeof n === "number" && Number.isFinite(n) && n > 0 ? n : null;
};

/** Accepts the server's checked draft or the offline reader's result; anything invalid becomes missing. */
export function normalizeDraft(raw: Partial<Record<keyof Draft, unknown>>): Draft {
  const dest = raw.destination === "moon" || raw.destination === "mars" ? raw.destination : null;
  const priority = raw.priority === "life" || raw.priority === "mission" || raw.priority === "commercial" ? raw.priority : "commercial";
  const mass = positive(raw.mass_kg);
  const vol = positive(raw.volume_m3);
  const bid = positive(raw.bid_usd_per_kg);
  const needed = typeof raw.needed_by === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw.needed_by) && d(raw.needed_by) > MISSION_DATE ? raw.needed_by : null;
  const shipper = typeof raw.shipper === "string" ? raw.shipper.trim().slice(0, 60) : "";
  const x: Draft = {
    item: typeof raw.item === "string" && raw.item.trim() ? raw.item.trim().slice(0, 80) : "Requested load",
    shipper: shipper || (dest ? BASES[dest].team : ""),
    destination: dest,
    priority,
    priority_reason: typeof raw.priority_reason === "string" ? raw.priority_reason.slice(0, 200) : "",
    mass_kg: mass && Math.round(mass),
    volume_m3: vol && round1(vol),
    needed_by: needed,
    bid_usd_per_kg: bid && Math.round(bid),
    questions: [],
  };
  const asked = Array.isArray(raw.questions) ? raw.questions.filter((q): q is string => typeof q === "string" && q.trim() !== "").slice(0, 5) : [];
  x.questions = asked.length ? asked : missingFields(x).map((f) => QUESTION_FOR[f]);
  return x;
}

export function readOffline(text: string): Draft {
  const t = text.replace(/(\d),(?=\d{3}\b)/g, "$1");
  const low = t.toLowerCase();
  const destination: BaseId | null = /\b(mars|ares|jezero)\b/.test(low) ? "mars" : /\b(moon|lunar|shackleton)\b/.test(low) ? "moon" : null;
  const tonnes = t.match(/(\d+(?:\.\d+)?)\s*(?:t|tonnes?|tons?)\b/i);
  const kgs = t.match(/(\d+(?:\.\d+)?)\s*kg\b/i);
  const vol = t.match(/(\d+(?:\.\d+)?)\s*(?:m³|m3|cubic met(?:re|er)s?)/i);
  const bid = t.match(/\$\s*(\d+(?:\.\d+)?)\s*(?:\/|per)\s*kg/i);
  const isoMatch = t.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  const longMatch = t.match(new RegExp(`\\b(\\d{1,2})\\s+(${MONTH_NAMES.join("|")})\\s+(\\d{4})\\b`, "i"));
  const daysMatch = t.match(/(\d+)\s*days?\b/i);
  let needed: string | null = null;
  if (isoMatch) needed = isoMatch[1];
  else if (longMatch) needed = isoDate(Date.UTC(+longMatch[3], MONTH_NAMES.indexOf(longMatch[2].toLowerCase()), +longMatch[1]));
  else if (daysMatch) needed = isoDate(MISSION_DATE + +daysMatch[1] * DAY);

  const lifeWord = low.match(/\b(oxygen|o2|co2|co₂|scrubbers?|water|food|medical|medication|medicine|antiviral|pressure|air|life support)\b/);
  const missionWord = low.match(/\b(power|reactor|greenhouse|repair|spare|antenna|comms|habitat)\b/);
  let priority: Priority = "commercial";
  let reason = "Nothing in the request says the crew or the base depends on it.";
  if (bid) reason = "A company is paying to ship it for its own business.";
  else if (lifeWord) [priority, reason] = ["life", `It concerns ${lifeWord[1]}, which keeps the crew alive.`];
  else if (missionWord) [priority, reason] = ["mission", `It concerns ${missionWord[1]}, which keeps the base working.`];

  const itemMatch = t.match(/\b(?:need|needs|ship)\s+(?:(?:an|a|the)\s+)?([^.,;\n]+?)(?:\s+(?:on|by|and|for|to|before)\b|[.,;\n])/i);
  const company = t.match(/\bthis is ([A-Z][\w&.\- ]*?)(?:[.,]|\s+here\b)/);

  return normalizeDraft({
    item: itemMatch ? itemMatch[1].trim().replace(/^./, (c) => c.toUpperCase()) : "Requested load",
    shipper: company ? company[1].trim() : "",
    destination,
    priority,
    priority_reason: reason,
    mass_kg: tonnes ? Math.round(+tonnes[1] * 1000) : kgs ? Math.round(+kgs[1]) : null,
    volume_m3: vol ? +vol[1] : null,
    needed_by: needed,
    bid_usd_per_kg: bid ? Math.round(+bid[1]) : null,
    questions: [],
  });
}

export function offlineBrief(m: Manifest, plan: Plan): string {
  const f = m.flight;
  const base = BASES[f.dest].name;
  const late = m.bumped.filter((b) => statusOf(b, plan).kind === "late");
  const out = [`To the commander of ${base}`];
  let lead = `${m.loaded.length} loads are on ${f.id}, which leaves ${fmtDay(f.launch)}.`;
  if (!m.bumped.length) lead += " Everything that was booked fits.";
  else
    lead +=
      ` ${m.bumped.length} ${m.bumped.length === 1 ? "load didn't" : "loads didn't"} fit and will come on a later rocket` +
      (late.length ? `. ${late.length === 1 ? "This one arrives" : "These arrive"} after you need ${late.length === 1 ? "it" : "them"}: ${late.map((b) => b.item).join(", ")}.` : ", still in time.");
  out.push(lead, "", "To the senders whose cargo moved");
  if (!m.bumped.length) out.push("Nobody's cargo had to move.");
  for (const b of m.bumped) {
    const st = statusOf(b, plan);
    // Mid-sentence the item is lowercased, but acronyms such as LED keep their capitals.
    const item = b.item.replace(/\S+/g, (w) => (w.length > 1 && w === w.toUpperCase() ? w : w.toLowerCase()));
    out.push(`- ${b.shipper}: your ${item} ${st.flight ? `now goes on ${st.flight.id} and lands ${fmtDay(st.arrive!)}` : "has no rocket with room yet"}${st.kind === "late" && st.flight ? `, ${dur(st.gap!)} after the date you asked for` : ""}.`);
  }
  if (late.length) {
    out.push("", "Decisions for the commander");
    const free = f.massCap - m.mass;
    for (const b of late.slice(0, 2)) {
      out.push(`- ${b.item} needs ${num(b.mass)} kg and only ${num(free)} kg is free on ${f.id}. Should something else make room, or can the base manage until ${fmtDay(statusOf(b, plan).arrive!)}?`);
    }
  }
  return out.join("\n");
}
