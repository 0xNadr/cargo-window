import { isoDate, type Booking } from "@/lib/engine";
import type { Draft } from "@/lib/offline";

// Empty means the same origin, which is how the FastAPI server hosts the built app.
const API = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export interface ApiError {
  code: string;
}

async function call<T>(path: string, body?: unknown): Promise<T> {
  const init: RequestInit =
    body === undefined ? {} : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
  const res = await fetch(`${API}/api/${path}`, init);
  if (!res.ok) {
    let code = `http_${res.status}`;
    try {
      const detail = (await res.json()).detail;
      if (typeof detail === "string") code = detail;
    } catch {
      // keep the status code
    }
    throw { code } satisfies ApiError;
  }
  return res.json() as Promise<T>;
}

const toApi = (b: Booking) => ({
  id: b.id, dest: b.dest, item: b.item, shipper: b.shipper, priority: b.priority,
  mass: b.mass, vol: b.vol, needed_by: isoDate(b.neededBy), bid: b.bid,
});

export const bookingsSignature = (bookings: Booking[]): string => JSON.stringify(bookings.map(toApi));

export const api = {
  health: () => call<{ ai: boolean; model: string | null }>("health"),
  plan: (bookings: Booking[]) =>
    call<{ manifests: { flight_id: string; fingerprint: string }[]; days_short: number }>("plan", { bookings: bookings.map(toApi) }),
  intake: (text: string) => call<Draft>("intake", { text }),
  brief: (bookings: Booking[], flightId: string) => call<{ text: string }>("brief", { bookings: bookings.map(toApi), flight_id: flightId }),
};

export function aiFailedNote(e: unknown): string {
  const code = (e as ApiError | undefined)?.code;
  if (code === "rate_limited") return "Claude is busy right now, so the offline reader did it.";
  if (code === "no_api_key") return "The server has no Claude key, so the offline reader did it.";
  return "Claude didn't answer, so the offline reader did it.";
}
