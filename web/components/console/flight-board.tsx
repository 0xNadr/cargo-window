"use client";

import { useState } from "react";
import { CapacityBar } from "@/components/console/priority-chip";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BASES, flightById, flightsFor, statusOf, type BaseId, type Booking, type Flight, type Plan } from "@/lib/engine";
import { fmtDate, num } from "@/lib/format";
import { cn } from "@/lib/utils";

function FlightRow({ flight, plan, selected, onSelect }: { flight: Flight; plan: Plan; selected: boolean; onSelect: () => void }) {
  const m = plan.manifests.get(flight.id)!;
  const late = [...m.loaded, ...m.bumped].filter((b: Booking) => statusOf(b, plan).kind === "late").length;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "grid w-full gap-2 rounded-lg border bg-background/40 p-3 text-left transition-colors outline-none hover:border-ring/60 focus-visible:ring-3 focus-visible:ring-ring/50",
        selected && "border-primary bg-primary/10",
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="font-mono font-medium">{flight.id}</span>
        <span className="font-mono text-xs text-muted-foreground">{fmtDate(flight.launch)}</span>
        {late > 0 ? (
          <Badge variant="destructive">{late} late</Badge>
        ) : m.bumped.length > 0 ? (
          <Badge variant="outline" className="text-moved">{m.bumped.length} moved</Badge>
        ) : m.loaded.length > 0 ? (
          <Badge variant="outline" className="text-ok">all fit</Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">empty</Badge>
        )}
      </span>
      <CapacityBar parts={m.loaded.map((b) => ({ priority: b.priority, amount: b.mass }))} cap={flight.massCap} className="h-1.5" />
      <span className="text-xs text-muted-foreground tabular-nums">
        {m.loaded.length} loads · {num(m.mass)} of {num(flight.massCap)} kg{m.bumped.length ? ` · ${m.bumped.length} bumped` : ""}
      </span>
    </button>
  );
}

export function FlightBoard({ plan, selected, onSelect }: { bookings: Booking[]; plan: Plan; selected: string; onSelect: (id: string) => void }) {
  const selectedBase = flightById.get(selected)?.dest ?? "mars";
  // Follow the base of the selected flight, e.g. when a launch is picked on the timeline, but let the user switch tabs freely.
  const [view, setView] = useState<{ selected: string; tab: BaseId }>({ selected, tab: selectedBase });
  if (view.selected !== selected) setView({ selected, tab: selectedBase });
  const tab = view.tab;
  const setTab = (next: BaseId) => setView({ selected, tab: next });
  const shown: Record<BaseId, Flight[]> = { moon: flightsFor("moon").slice(0, 3), mars: flightsFor("mars") };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Badge variant="outline" className="border-primary/60 text-primary">Step 2</Badge>
          Flight board
        </CardTitle>
        <CardDescription>Pick a flight to see its manifest. The bar shows how full it is.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={(v) => setTab(v as BaseId)}>
          <TabsList className="w-full">
            <TabsTrigger value="mars">Mars · {BASES.mars.name}</TabsTrigger>
            <TabsTrigger value="moon">Moon · {BASES.moon.name}</TabsTrigger>
          </TabsList>
          {(Object.keys(shown) as BaseId[]).map((base) => (
            <TabsContent key={base} value={base} className="grid gap-2 pt-2">
              <p className="text-xs text-muted-foreground">
                {base === "mars" ? "One launch window every 26 months, a 205-day trip." : "A flight every four weeks, a 4-day trip. Next three shown."}
              </p>
              {shown[base].map((f) => (
                <FlightRow key={f.id} flight={f} plan={plan} selected={f.id === selected} onSelect={() => onSelect(f.id)} />
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
