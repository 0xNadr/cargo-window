"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcwIcon } from "lucide-react";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand-logo";
import { BaseCards } from "@/components/console/base-cards";
import { Inbox } from "@/components/console/inbox";
import { LaunchTimeline } from "@/components/console/launch-timeline";
import { ManifestView, type EarthCheck } from "@/components/console/manifest-view";
import { ManualBookingDialog } from "@/components/console/manual-booking-dialog";
import { UpdateMessage, WhatChanged, WhatIf, type Activity } from "@/components/console/side-panels";
import { StatusBanner } from "@/components/console/status-banner";
import { useGuide, useServer } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, bookingsSignature } from "@/lib/api";
import { flightById, flightsFor, pack, statusOf, type BaseId, type Booking } from "@/lib/engine";
import { headline, knockOnEffects, placementLine } from "@/lib/impact";
import { EVENTS, REQUESTS, SEED_COUNT, seedBookings, toBooking, type BookingRow } from "@/lib/scenario";

type Tab = "rocket" | "inbox" | "calendar";

export function Console() {
  const server = useServer();
  const guide = useGuide();
  const [bookings, setBookings] = useState<Booking[]>(seedBookings);
  const [applied, setApplied] = useState(0);
  const [selected, setSelected] = useState("MS-07");
  const [tab, setTab] = useState<Tab>("inbox");
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [earth, setEarth] = useState<EarthCheck | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [read, setRead] = useState<Set<string>>(new Set());
  const [booked, setBooked] = useState<Map<string, string>>(new Map());
  // Bumped on "Start over" so panels with their own state (drafts, written updates) start fresh too.
  const [run, setRun] = useState(0);
  const nextId = useRef(SEED_COUNT + 1);
  const activityId = useRef(1);
  const plan = useMemo(() => pack(bookings), [bookings]);
  const status = headline(bookings, plan);
  const unread = REQUESTS.filter((m) => !read.has(m.id)).length;

  // The Earth server packs the same bookings; its fingerprints are compared with the browser's on every change.
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

  function record(title: string, lines: Activity["lines"]) {
    setActivity((list) => [{ id: activityId.current++, title, lines }, ...list].slice(0, 8));
  }

  /** Adds loads, shows the rocket they went to, and records what that did to everyone else. */
  function addLoads(rows: BookingRow[], title: string): string {
    const added = rows.map((row) => toBooking(row, `B${nextId.current++}`));
    const next = [...bookings, ...added];
    const nextPlan = pack(next);
    const placed = placementLine(added[0], nextPlan);
    const effects = knockOnEffects(plan, nextPlan, next, new Set(added.map((b) => b.id)));
    setBookings(next);
    setSelected(statusOf(added[0], nextPlan).flight?.id ?? flightsFor(added[0].dest)[0].id);
    setFresh(new Set(added.map((b) => b.id)));
    window.setTimeout(() => setFresh(new Set()), 2600);
    record(title, [placed, ...(effects.length ? effects : [{ tone: "good" as const, text: "Nobody else's cargo had to move." }])]);
    const bad = effects.filter((e) => e.tone !== "good").length;
    (bad ? toast.warning : toast.success)(title, { description: bad ? `${bad} other ${bad === 1 ? "load is" : "loads are"} now late. See "What changed".` : placed.text });
    return `${placed.text} ${bad ? `${bad} other ${bad === 1 ? "load" : "loads"} had to move and will be late.` : "Nobody else's cargo was made late."}`;
  }

  function removeLoad(id: string) {
    const b = bookings.find((x) => x.id === id);
    if (!b) return;
    const next = bookings.filter((x) => x.id !== id);
    const effects = knockOnEffects(plan, pack(next), next, new Set());
    setBookings(next);
    record(`Removed ${b.item}`, effects.length ? effects : [{ tone: "good", text: "No other cargo moved." }]);
  }

  function reset() {
    setBookings(seedBookings());
    nextId.current = SEED_COUNT + 1;
    setApplied(0);
    setSelected("MS-07");
    setTab("inbox");
    setActivity([]);
    setRead(new Set());
    setBooked(new Map());
    setRun((r) => r + 1);
    toast("Back to the start of 2 May 2035");
  }

  function applyEvent(index: number) {
    const e = EVENTS[index];
    addLoads([e.add], e.title);
    setApplied(index + 1);
    setTab("rocket");
  }

  function selectBase(base: BaseId) {
    setSelected(flightsFor(base)[0].id);
    setTab("rocket");
  }

  const selectedBase = flightById.get(selected)?.dest ?? "mars";

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="flex items-center gap-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            <BrandLogo size={44} /> Cargo desk
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            It&apos;s 2 May 2035. You decide what goes on the next rockets to the Moon and Mars. Requests arrive in the inbox; the plan below shows what flies and who has
            to wait.{" "}
            <button type="button" className="text-foreground underline underline-offset-2" onClick={() => guide.setOpen(true)}>
              How it works
            </button>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ManualBookingDialog onBook={(row) => addLoads([row], `Booked ${row[1]} by hand`)} />
          <Button variant="ghost" size="sm" onClick={reset}>
            <RotateCcwIcon /> Start over
          </Button>
        </div>
      </div>

      <StatusBanner
        headline={status}
        unread={unread}
        onShow={() => status.focus && selectBase(status.focus)}
        onInbox={() => setTab("inbox")}
      />

      <BaseCards bookings={bookings} plan={plan} selectedBase={selectedBase} onSelect={selectBase} />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="min-w-0 rounded-xl border bg-card p-4 sm:p-5">
          <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
            {/* Short labels on phones so the three tabs fit side by side. */}
            <TabsList className="mb-4 w-full sm:w-fit">
              <TabsTrigger value="inbox">
                Inbox{unread > 0 && <span className="ml-1.5 rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">{unread}</span>}
              </TabsTrigger>
              <TabsTrigger value="rocket">
                <span className="sm:hidden">Rocket</span>
                <span className="hidden sm:inline">What&apos;s on the rocket</span>
              </TabsTrigger>
              <TabsTrigger value="calendar">
                <span className="sm:hidden">Calendar</span>
                <span className="hidden sm:inline">Launch calendar</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="inbox">
              <Inbox
                key={run}
                messages={REQUESTS}
                read={read}
                booked={booked}
                onOpen={(id) => setRead((r) => new Set(r).add(id))}
                onBook={(row, messageId) => {
                  const outcome = addLoads([row], `Booked ${row[1]}`);
                  setBooked((m) => new Map(m).set(messageId, `Added to the plan. ${outcome}`));
                }}
              />
            </TabsContent>
            <TabsContent value="rocket">
              <ManifestView
                manifest={plan.manifests.get(selected)!}
                plan={plan}
                fresh={fresh}
                earth={earth && earth.sig === bookingsSignature(bookings) ? earth : null}
                serverUp={server.up}
                onSelect={setSelected}
                onRemove={removeLoad}
              />
            </TabsContent>
            <TabsContent value="calendar">
              <LaunchTimeline
                framed={false}
                bookings={bookings}
                plan={plan}
                selected={selected}
                onSelect={(id) => {
                  setSelected(id);
                  setTab("rocket");
                }}
              />
            </TabsContent>
          </Tabs>
        </section>

        <aside className="grid min-w-0 grid-cols-1 gap-6">
          <WhatChanged activity={activity} />
          <UpdateMessage key={run} manifest={plan.manifests.get(selected)!} bookings={bookings} plan={plan} />
          <WhatIf applied={applied} onApply={applyEvent} />
        </aside>
      </div>
    </div>
  );
}
