import { DAY, BASES, PRIORITY, type Booking, type Status, type Step } from "@/lib/engine";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export const num = (n: number): string => n.toLocaleString("en-US");
export const fmtVol = (n: number): string => `${(Math.round(n * 10) / 10).toLocaleString("en-US")} m³`;

export function fmtDate(t: number): string {
  const x = new Date(t);
  return `${String(x.getUTCDate()).padStart(2, "0")} ${MONTHS[x.getUTCMonth()]} ${x.getUTCFullYear()}`;
}

export const dur = (n: number): string => (n < 60 ? `${n} ${n === 1 ? "day" : "days"}` : `${Math.round(n / 30.44)} months`);

export function gapText(ms: number): string {
  const n = Math.round(ms / DAY);
  return n < 60 ? `${Math.round(n / 7)} weeks` : `${Math.round(n / 30.44)} months`;
}

export function statusText(s: Status): string {
  if (s.kind === "late") return s.flight ? `Late by ${dur(s.gap!)}` : "No flight has room";
  const spare = -s.gap!;
  const tail = spare > 0 ? `${dur(spare)} spare` : "no margin";
  return s.kind === "moved" ? `Moved, ${tail}` : `On time, ${tail}`;
}

export function consequence(b: Booking, s: Status): string {
  if (s.kind !== "late") return "";
  if (!s.flight) return "No flight in the schedule has room for it.";
  const t = dur(s.gap!);
  if (b.priority === "life") return `Arrives ${t} after ${BASES[b.dest].name} runs out.`;
  if (b.priority === "mission") return `Arrives ${t} after it is needed. That work stops until then.`;
  return `Arrives ${t} after ${b.shipper} needs it.`;
}

export function loadReason(b: Booking): string {
  if (b.priority === "life") return "life-critical, loads before everything else";
  if (b.priority === "mission") return `mission-critical, needed by ${fmtDate(b.neededBy)}`;
  return `bid $${num(b.bid ?? 0)}/kg`;
}

export function bumpReason(step: Step): string {
  const { booking: b, massLeft, volLeft } = step;
  return b.mass > massLeft
    ? `needs ${num(b.mass)} kg, ${num(Math.max(0, massLeft))} kg left`
    : `needs ${fmtVol(b.vol)}, ${fmtVol(Math.max(0, volLeft))} left`;
}

export const priorityLabel = (p: Booking["priority"]): string => `${PRIORITY[p].code} ${PRIORITY[p].label}`;
