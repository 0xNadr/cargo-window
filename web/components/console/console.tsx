"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcwIcon } from "lucide-react";
import { toast } from "sonner";
import { FlightBoard } from "@/components/console/flight-board";
import { IntroStrip } from "@/components/console/intro-strip";
import { LaunchTimeline } from "@/components/console/launch-timeline";
import { ManifestPanel, type EarthCheck } from "@/components/console/manifest-panel";
import { ManualBookingDialog } from "@/components/console/manual-booking-dialog";
import { RequestDesk } from "@/components/console/request-desk";
import { ScenarioCard } from "@/components/console/scenario-card";
import { SummaryStats } from "@/components/console/summary-stats";
import { useServer } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { api, bookingsSignature } from "@/lib/api";
import { BASES, flightsFor, pack, statusOf, type Booking, type Plan } from "@/lib/engine";
import { dur } from "@/lib/format";
import { EVENTS, SEED_COUNT, seedBookings, toBooking, type BookingRow } from "@/lib/scenario";

const lateCount = (bookings: Booking[], plan: Plan) => bookings.filter((b) => statusOf(b, plan).kind === "late").length;

export function Console() {
  const server = useServer();
  const [bookings, setBookings] = useState<Booking[]>(seedBookings);
  const [applied, setApplied] = useState(0);
  const [selected, setSelected] = useState("MS-07");
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [earth, setEarth] = useState<EarthCheck | null>(null);
  const nextId = useRef(SEED_COUNT + 1);
  const plan = useMemo(() => pack(bookings), [bookings]);

  // The Earth server packs the same bookings; its fingerprints are compared with ours on every change.
  useEffect(() => {
    if (!server.up) return;
    const sig = bookingsSignature(bookings);
    let live = true;
    api
      .plan(bookings)
      .then((p) => live && setEarth({ sig, status: "ok", fingerprints: new Map(p.manifests.map((m) => [m.flight_id, m.fingerprint])) }))
      .catch(() => live && setEarth({ sig, status: "down", fingerprints: new Map() }));
    return () => {
      live = false;
    };
  }, [bookings, server.up]);

  /** Adds loads, selects the first flight to their base, and reports what changed. */
  function addLoads(rows: BookingRow[], what: string) {
    const added = rows.map((row) => toBooking(row, `B${nextId.current++}`));
    const next = [...bookings, ...added];
    const nextPlan = pack(next);
    const newlyLate = lateCount(next, nextPlan) - lateCount(bookings, plan) - added.filter((b) => statusOf(b, nextPlan).kind === "late").length;
    setBookings(next);
    setSelected(flightsFor(added[0].dest)[0].id);
    setFresh(new Set(added.map((b) => b.id)));
    window.setTimeout(() => setFresh(new Set()), 2600);

    const first = added[0];
    const st = statusOf(first, nextPlan);
    const where = st.flight
      ? `${first.item} flies on ${st.flight.id}${st.kind === "late" ? `, ${dur(st.gap!)} late` : ""}.`
      : `No flight to ${BASES[first.dest].name} has room for it.`;
    const knockOn = newlyLate > 0 ? `${newlyLate} other ${newlyLate === 1 ? "load now arrives" : "loads now arrive"} late.` : "No other load is made late.";
    (newlyLate > 0 ? toast.warning : toast.success)(what, { description: `${where} ${knockOn}` });
  }

  function removeLoad(id: string) {
    const b = bookings.find((x) => x.id === id);
    setBookings(bookings.filter((x) => x.id !== id));
    if (b) toast(`Removed ${b.item}`);
  }

  function reset() {
    setBookings(seedBookings());
    nextId.current = SEED_COUNT + 1;
    setApplied(0);
    setSelected("MS-07");
    toast("Scenario reset to 02 May 2035");
  }

  function applyEvent(index: number) {
    addLoads([EVENTS[index].add], EVENTS[index].title);
    setApplied(index + 1);
  }

  const flight = plan.manifests.get(selected)!;

  return (
    <div className="grid gap-6">
      <IntroStrip />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="label-caps text-xs text-muted-foreground">Earth cargo desk</p>
          <h1 className="font-heading text-4xl font-extrabold tracking-wide uppercase sm:text-5xl">Flights to the Moon and Mars</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <ManualBookingDialog onBook={(row) => addLoads([row], "Load booked")} />
          <Button variant="ghost" size="sm" onClick={reset}>
            <RotateCcwIcon /> Reset scenario
          </Button>
        </div>
      </div>

      <SummaryStats bookings={bookings} plan={plan} />
      <LaunchTimeline bookings={bookings} plan={plan} selected={selected} onSelect={setSelected} />

      <div className="grid items-start gap-6 lg:grid-cols-12">
        <div className="grid gap-6 lg:col-span-5">
          <RequestDesk onBook={(row) => addLoads([row], "Request approved and booked")} />
          <FlightBoard bookings={bookings} plan={plan} selected={selected} onSelect={setSelected} />
          <ScenarioCard applied={applied} onApply={applyEvent} />
        </div>
        <div className="lg:col-span-7">
          <ManifestPanel
            manifest={flight}
            bookings={bookings}
            plan={plan}
            fresh={fresh}
            earth={earth && earth.sig === bookingsSignature(bookings) ? earth : null}
            serverUp={server.up}
            onSelect={setSelected}
            onRemove={removeLoad}
          />
        </div>
      </div>
    </div>
  );
}
