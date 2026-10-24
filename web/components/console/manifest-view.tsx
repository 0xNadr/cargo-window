"use client";

import { ChevronDownIcon, InfoIcon, XIcon } from "lucide-react";
import { CapacityBar, CLASS_MEANING, PriorityChip, SEGMENT, StatusPill } from "@/components/console/priority-chip";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BASES, arrival, fingerprint, flightsFor, nextFlight, statusOf, type Booking, type Manifest, type Plan, type Priority, type Status } from "@/lib/engine";
import { consequence, dur, fmtDay, gapText, num } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface EarthCheck {
  sig: string;
  status: "ok" | "down";
  fingerprints: Map<string, string>;
}

function pillText(s: Status): string {
  if (s.kind === "late") return s.flight ? `Late by ${dur(s.gap!)}` : "No room on any rocket";
  return s.kind === "moved" ? "Moved here, on time" : "On time";
}

function why(b: Booking, massLeft: number, volLeft: number): string {
  return b.mass > massLeft
    ? `Needs ${num(b.mass)} kg, only ${num(Math.max(0, massLeft))} kg was left.`
    : `Needs ${Math.round(b.vol * 10) / 10} m³ of space, only ${Math.max(0, Math.round(volLeft * 10) / 10)} m³ was left.`;
}

function Gauge({ label, used, cap, unit, parts }: { label: string; used: number; cap: number; unit: string; parts: { priority: Priority; amount: number }[] }) {
  const show = (n: number) => num(Math.round(n * 10) / 10);
  return (
    <div className="grid gap-1.5">
      <div className="flex flex-wrap justify-between gap-x-2 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span>
          {show(used)} of {show(cap)} {unit} <span className="text-muted-foreground">· {show(cap - used)} {unit} left</span>
        </span>
      </div>
      <CapacityBar parts={parts} cap={cap} className="h-2.5" />
    </div>
  );
}

function EarthCheckLine({ manifest, earth, serverUp }: { manifest: Manifest; earth: EarthCheck | null; serverUp: boolean }) {
  const code = fingerprint(manifest);
  const remote = earth?.fingerprints.get(manifest.flight.id);
  const [text, tone] = !serverUp
    ? ["Working offline: this plan lives in your browser only.", "text-muted-foreground"]
    : !earth
      ? ["Checking with the Earth server…", "text-muted-foreground"]
      : earth.status === "down"
        ? ["The Earth server didn't answer. Working offline.", "text-muted-foreground"]
        : remote === code
          ? ["Earth and the base hold the same plan.", "text-ok"]
          : ["Earth and the base hold different plans. Don't send this one.", "text-late"];
  return (
    <p className="flex items-center gap-1.5 text-sm">
      <span className={tone}>{text}</span>
      <Tooltip>
        <TooltipTrigger render={<button type="button" className="text-muted-foreground hover:text-foreground" aria-label="What is the plan check?" />}>
          <InfoIcon className="size-3.5" />
        </TooltipTrigger>
        <TooltipContent className="max-w-72">
          Earth and each base work out the plan separately with the same rules, then compare a short code ({code}). If the codes match, both sides agree, even when Mars is 22 light-minutes away.
        </TooltipContent>
      </Tooltip>
    </p>
  );
}

function LoadRow({ b, plan, fresh, onRemove }: { b: Booking; plan: Plan; fresh: boolean; onRemove: (id: string) => void }) {
  const st = statusOf(b, plan);
  const from = plan.placements.get(b.id)!.bumpedFrom;
  const cons = consequence(b, st);
  return (
    <li className={cn("group grid grid-cols-1 items-start gap-x-4 gap-y-1.5 py-3 sm:grid-cols-[1fr_auto]", fresh && "is-new rounded-md")}>
      <div className="min-w-0">
        <p className="font-medium">{b.item}</p>
        <p className="text-sm text-muted-foreground">
          From {b.shipper} · {num(b.mass)} kg · needed by {fmtDay(b.neededBy)}
          {from.length > 0 && ` · moved from ${from.map((x) => x.id).join(", ")}`}
        </p>
        {cons && <p className="mt-1 text-sm text-late">{cons}</p>}
      </div>
      <div className="flex items-center gap-1">
        <StatusPill kind={st.kind}>{pillText(st)}</StatusPill>
        <Button variant="ghost" size="icon-xs" className="opacity-60 group-hover:opacity-100" onClick={() => onRemove(b.id)} aria-label={`Remove ${b.item} from the plan`}>
          <XIcon />
        </Button>
      </div>
    </li>
  );
}

export function ManifestView({
  manifest: m,
  plan,
  fresh,
  earth,
  serverUp,
  onSelect,
  onRemove,
}: {
  manifest: Manifest;
  plan: Plan;
  fresh: Set<string>;
  earth: EarthCheck | null;
  serverUp: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const f = m.flight;
  const base = BASES[f.dest];
  const next = nextFlight(f);
  const all = flightsFor(f.dest);
  const choices = f.dest === "mars" ? all : [...all.slice(0, 3), ...(all.indexOf(f) >= 3 ? [f] : [])];

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {f.id} to {base.name}
          </h2>
          <p className="text-muted-foreground">
            Leaves {fmtDay(f.launch)} · lands {fmtDay(arrival(f))} · {base.transitDays}-day trip
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Choose a rocket">
          {choices.map((x) => (
            <Button key={x.id} size="sm" variant={x.id === f.id ? "secondary" : "ghost"} onClick={() => onSelect(x.id)} aria-pressed={x.id === f.id}>
              {x.id} <span className="text-muted-foreground">{fmtDay(x.launch).replace(/^\d+ /, "")}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Gauge label="Weight" used={m.mass} cap={f.massCap} unit="kg" parts={m.loaded.map((b) => ({ priority: b.priority, amount: b.mass }))} />
        <Gauge label="Space" used={m.vol} cap={f.volCap} unit="m³" parts={m.loaded.map((b) => ({ priority: b.priority, amount: b.vol }))} />
      </div>

      {m.loaded.length === 0 && m.bumped.length === 0 && (
        <p className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
          Nothing is booked on this rocket yet. Loads that don&apos;t fit on earlier rockets land here first.
        </p>
      )}

      {(Object.keys(CLASS_MEANING) as Priority[]).map((p) => {
        const loads = m.loaded.filter((b) => b.priority === p);
        if (!loads.length) return null;
        return (
          <section key={p} className="grid gap-1">
            <h3 className="flex items-center gap-2 text-sm font-medium">
              <span className={cn("size-2.5 rounded-full", SEGMENT[p])} />
              {CLASS_MEANING[p]}
              <span className="text-muted-foreground">· {loads.length}</span>
            </h3>
            <ul className="divide-y">
              {loads.map((b) => (
                <LoadRow key={b.id} b={b} plan={plan} fresh={fresh.has(b.id)} onRemove={onRemove} />
              ))}
            </ul>
          </section>
        );
      })}

      {m.bumped.length > 0 && (
        <section className="grid gap-2">
          <h3 className="text-sm font-medium">Didn&apos;t fit on this rocket · {m.bumped.length}</h3>
          <ul className="grid gap-2">
            {m.bumped.map((b) => {
              const st = statusOf(b, plan);
              const step = m.steps.find((s) => s.booking === b)!;
              return (
                <li key={b.id} className={cn("grid gap-1 rounded-lg border p-3", st.kind === "late" ? "border-late/40 bg-late/5" : "bg-muted/40", fresh.has(b.id) && "is-new")}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-medium">
                      {b.item} <span className="font-normal text-muted-foreground">from {b.shipper}</span>
                    </p>
                    <StatusPill kind={st.kind}>{pillText(st)}</StatusPill>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {why(b, step.massLeft, step.volLeft)}{" "}
                    {st.flight ? (
                      <>
                        It now goes on{" "}
                        <button type="button" className="font-medium text-foreground underline underline-offset-2" onClick={() => onSelect(st.flight!.id)}>
                          {st.flight.id}
                        </button>
                        , landing {fmtDay(st.arrive!)}.
                      </>
                    ) : (
                      "No later rocket has room."
                    )}
                  </p>
                  {st.kind === "late" && <p className="text-sm text-late">{consequence(b, st)}</p>}
                  <PriorityChip priority={b.priority} className="text-muted-foreground" />
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="grid gap-2 border-t pt-4">
        {next && (
          <p className="text-sm text-muted-foreground">
            If something misses {f.id}, the next rocket to {base.name} is {next.id} on {fmtDay(next.launch)},{" "}
            <span className={cn(next.launch - f.launch > 60 * 864e5 && "font-medium text-foreground")}>{gapText(next.launch - f.launch)} later</span>.
          </p>
        )}
        <EarthCheckLine manifest={m} earth={earth} serverUp={serverUp} />
        {m.steps.length > 0 && (
          <Collapsible>
            <CollapsibleTrigger render={<Button variant="ghost" size="sm" className="group/steps -ml-2 h-auto min-h-7 justify-start py-0.5 text-left whitespace-normal text-muted-foreground" />}>
              <ChevronDownIcon className="transition-transform group-data-[panel-open]/steps:rotate-180" />
              Why this order? See how {f.id} was packed
            </CollapsibleTrigger>
            <CollapsibleContent>
              <p className="mt-2 text-sm text-muted-foreground">
                The rules load what keeps the crew alive first, then what keeps the base running, then paid cargo with the highest offer per kilogram. Anything that doesn&apos;t fit waits for the next rocket.
              </p>
              <ol className="mt-2 grid list-decimal gap-1 pl-6 text-sm marker:text-muted-foreground">
                {m.steps.map((s) => (
                  <li key={s.booking.id}>
                    <span className={s.fits ? "" : "text-late"}>{s.fits ? "Loaded" : "Didn't fit"}:</span> {s.booking.item}
                    <span className="text-muted-foreground"> ({num(s.booking.mass)} kg)</span>
                  </li>
                ))}
              </ol>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  );
}
