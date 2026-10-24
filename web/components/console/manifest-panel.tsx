"use client";

import { useState } from "react";
import { ChevronDownIcon, Loader2Icon, SparklesIcon, XIcon } from "lucide-react";
import { CapacityBar, PriorityChip, STATUS_TEXT } from "@/components/console/priority-chip";
import { useServer } from "@/components/providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { aiFailedNote, api } from "@/lib/api";
import { BASES, DAY, arrival, fingerprint, nextFlight, statusOf, type Booking, type Manifest, type Plan } from "@/lib/engine";
import { bumpReason, consequence, fmtDate, fmtVol, gapText, loadReason, num, statusText } from "@/lib/format";
import { offlineBrief } from "@/lib/offline";
import { cn } from "@/lib/utils";

export interface EarthCheck {
  sig: string;
  status: "ok" | "down";
  fingerprints: Map<string, string>;
}

interface Props {
  manifest: Manifest;
  bookings: Booking[];
  plan: Plan;
  fresh: Set<string>;
  earth: EarthCheck | null;
  serverUp: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}

function FingerprintLine({ manifest, earth, serverUp }: { manifest: Manifest; earth: EarthCheck | null; serverUp: boolean }) {
  const local = fingerprint(manifest);
  const remote = earth?.fingerprints.get(manifest.flight.id);
  let check: React.ReactNode;
  if (!serverUp) check = <span className="text-muted-foreground">Earth server not reachable: this is the base copy on its own.</span>;
  else if (!earth) check = <span className="text-muted-foreground">Checking with the Earth server…</span>;
  else if (earth.status === "down") check = <span className="text-muted-foreground">The Earth server didn&apos;t answer. Showing the base copy.</span>;
  else if (remote === local) check = <span className="text-ok">Earth server computed {remote}: both copies agree.</span>;
  else check = <span className="text-late">Earth server computed {remote}: the copies disagree. Don&apos;t send this manifest.</span>;
  return (
    <p className="text-sm">
      <span className="text-muted-foreground">Manifest fingerprint </span>
      <span className="font-mono tracking-wider text-primary">{local}</span> · {check}
    </p>
  );
}

function Capacity({ label, used, cap, unit, parts }: { label: string; used: number; cap: number; unit: string; parts: Parameters<typeof CapacityBar>[0]["parts"] }) {
  const show = (n: number) => num(Math.round(n * 10) / 10);
  return (
    <div className="grid gap-1.5">
      <div className="flex flex-wrap justify-between gap-2 font-mono text-xs text-muted-foreground tabular-nums">
        <span>{label}</span>
        <span>
          <span className="text-foreground">{show(used)}</span> of {show(cap)} {unit} · {show(cap - used)} {unit} free
        </span>
      </div>
      <CapacityBar parts={parts} cap={cap} className="h-3.5 border" />
    </div>
  );
}

function BriefSection({ manifest, bookings, plan }: { manifest: Manifest; bookings: Booking[]; plan: Plan }) {
  const server = useServer();
  const sig = `${manifest.flight.id}|${manifest.loaded.map((b) => b.id).join(",")}|${manifest.bumped.map((b) => b.id).join(",")}`;
  const [brief, setBrief] = useState<{ sig: string; text: string; source: "claude" | "offline"; warn: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const current = brief?.sig === sig ? brief : null;
  const stale = brief && !current && brief.sig.startsWith(`${manifest.flight.id}|`);

  async function write() {
    setBusy(true);
    let text = "";
    let warn = "";
    if (server.ai) {
      try {
        text = (await api.brief(bookings, manifest.flight.id)).text;
      } catch (e) {
        warn = aiFailedNote(e);
      }
    }
    setBrief({ sig, text: text || offlineBrief(manifest, plan), source: text ? "claude" : "offline", warn });
    setBusy(false);
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="label-caps flex items-center gap-2 text-sm text-muted-foreground">
          Brief for the people affected <Badge variant="outline" className="gap-1 text-primary"><SparklesIcon /> AI</Badge>
        </h3>
        <Button size="sm" variant="outline" onClick={write} disabled={busy}>
          {busy && <Loader2Icon className="animate-spin" />}
          {busy ? (server.ai ? "Claude is writing…" : "Writing…") : current ? "Write again" : "Write brief"}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Drafted from the planner&apos;s numbers only. Check it before you send it.
        {current && <span className={cn("ml-2 font-mono text-xs", current.source === "claude" ? "text-primary" : "")}>{current.source === "claude" ? "Drafted by Claude" : "Drafted by the offline template"}</span>}
      </p>
      {current?.warn && <p className="text-xs text-primary">{current.warn}</p>}
      {current ? (
        <pre className="rounded-lg border bg-background/50 p-4 font-mono text-[13px] leading-relaxed whitespace-pre-wrap">{current.text}</pre>
      ) : (
        <p className="text-sm text-muted-foreground/80">{stale ? "The manifest changed since the last brief. Write it again." : "No brief yet for this flight."}</p>
      )}
    </div>
  );
}

export function ManifestPanel({ manifest: m, bookings, plan, fresh, earth, serverUp, onSelect, onRemove }: Props) {
  const f = m.flight;
  const base = BASES[f.dest];
  const next = nextFlight(f);
  const longWait = next && next.launch - f.launch > 60 * DAY;

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="gap-3 border-b py-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2">
              <Badge variant="outline" className="border-primary/60 text-primary">Step 3</Badge>
              <span className="label-caps text-xs text-muted-foreground">Flight manifest</span>
            </p>
            <h2 className="mt-1 font-heading text-6xl leading-[1.02] font-semibold tracking-tight">{f.id}</h2>
            <p className="mt-1 text-lg">
              Earth → {base.name} <span className="text-muted-foreground">· {base.body}</span>
            </p>
          </div>
          <dl className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs">
            {[["Launch", fmtDate(f.launch)], ["Arrives", fmtDate(arrival(f))], ["Trip", `${base.transitDays} days`]].map(([k, v]) => (
              <div key={k}>
                <dt className="tracking-wider text-muted-foreground uppercase">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className={cn("text-sm", longWait ? "text-primary" : "text-muted-foreground")}>
          {next ? (
            <>
              A load that misses {f.id} waits for{" "}
              <button type="button" className="font-mono underline underline-offset-2" onClick={() => onSelect(next.id)}>{next.id}</button> on {fmtDate(next.launch)},{" "}
              {gapText(next.launch - f.launch)} later.
            </>
          ) : (
            `This is the last flight to ${base.name} in the schedule.`
          )}
        </p>
        <FingerprintLine manifest={m} earth={earth} serverUp={serverUp} />
      </CardHeader>

      <CardContent className="grid gap-6 py-5">
        <div className="grid gap-3">
          <Capacity label="MASS" used={m.mass} cap={f.massCap} unit="kg" parts={m.loaded.map((b) => ({ priority: b.priority, amount: b.mass }))} />
          <Capacity label="VOLUME" used={m.vol} cap={f.volCap} unit="m³" parts={m.loaded.map((b) => ({ priority: b.priority, amount: b.vol }))} />
          <div className="flex flex-wrap gap-4 text-xs">
            <PriorityChip priority="life" />
            <PriorityChip priority="mission" />
            <PriorityChip priority="commercial" />
          </div>
        </div>

        <Separator />

        <div className="grid gap-2">
          <h3 className="label-caps text-sm text-muted-foreground">On board · {m.loaded.length}</h3>
          {m.loaded.length ? (
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Load</TableHead>
                  <TableHead className="text-right">Mass</TableHead>
                  <TableHead className="text-right">Volume</TableHead>
                  <TableHead>Needed by</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead><span className="sr-only">Remove</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {m.loaded.map((b) => {
                  const st = statusOf(b, plan);
                  const from = plan.placements.get(b.id)!.bumpedFrom;
                  const cons = consequence(b, st);
                  return (
                    <TableRow key={b.id} className={cn(fresh.has(b.id) && "is-new")}>
                      <TableCell className="align-top"><PriorityChip priority={b.priority} compact /></TableCell>
                      <TableCell className="min-w-44 align-top whitespace-normal">
                        <span className="font-semibold">{b.item}</span>
                        <span className="block text-xs text-muted-foreground">
                          {[b.shipper, b.priority === "commercial" ? `$${num(b.bid ?? 0)}/kg` : "", from.length ? `bumped from ${from.map((x) => x.id).join(", ")}` : ""].filter(Boolean).join(" · ")}
                        </span>
                      </TableCell>
                      <TableCell className="text-right align-top font-mono text-xs">{num(b.mass)} kg</TableCell>
                      <TableCell className="text-right align-top font-mono text-xs">{fmtVol(b.vol)}</TableCell>
                      <TableCell className="align-top font-mono text-xs">{fmtDate(b.neededBy)}</TableCell>
                      <TableCell className="align-top whitespace-normal">
                        <span className={cn("font-mono text-xs whitespace-nowrap", STATUS_TEXT[st.kind])}>{statusText(st)}</span>
                        {cons && <span className="block max-w-56 text-xs text-late">{cons}</span>}
                      </TableCell>
                      <TableCell className="align-top">
                        <Button variant="ghost" size="icon-xs" onClick={() => onRemove(b.id)} aria-label={`Remove ${b.item}`}>
                          <XIcon />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">Nothing booked on this flight yet. Loads bumped from earlier flights land here first.</p>
          )}
        </div>

        <div className="grid gap-2">
          <h3 className="label-caps text-sm text-muted-foreground">Bumped from this flight · {m.bumped.length}</h3>
          {m.bumped.length ? (
            <ul className="grid gap-2">
              {m.bumped.map((b) => {
                const st = statusOf(b, plan);
                const step = m.steps.find((s) => s.booking === b)!;
                const cons = consequence(b, st);
                return (
                  <li key={b.id} className={cn("grid gap-1 rounded-lg border p-3", st.kind === "late" ? "border-late/50 bg-late/10" : "bg-background/40", fresh.has(b.id) && "is-new")}>
                    <span className="flex flex-wrap items-baseline justify-between gap-2">
                      <span>
                        <span className="font-semibold">{b.item}</span> <span className="text-xs text-muted-foreground">· {b.shipper}</span>
                      </span>
                      <PriorityChip priority={b.priority} />
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">Did not fit: {bumpReason(step)}</span>
                    <span className="text-xs text-muted-foreground">
                      {st.flight ? (
                        <>
                          Now on <button type="button" className="font-mono text-primary underline underline-offset-2" onClick={() => onSelect(st.flight!.id)}>{st.flight.id}</button>, arrives {fmtDate(st.arrive!)}
                        </>
                      ) : (
                        "No later flight has room"
                      )}{" "}
                      · <span className={cn("font-mono", STATUS_TEXT[st.kind])}>{statusText(st)}</span>
                    </span>
                    {cons && <span className="text-sm text-late">{cons}</span>}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Every load offered to this flight fits.</p>
          )}
        </div>

        {(m.loaded.length > 0 || m.bumped.length > 0) && (
          <>
            <Separator />
            <BriefSection manifest={m} bookings={bookings} plan={plan} />
          </>
        )}

        {m.steps.length > 0 && (
          <Collapsible>
            <CollapsibleTrigger render={<Button variant="ghost" size="sm" className="group/steps -ml-2" />}>
              <ChevronDownIcon className="transition-transform group-data-[panel-open]/steps:rotate-180" />
              Why this manifest: the packing steps for {f.id}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ol className="mt-2 grid list-decimal gap-1.5 pl-6 text-sm marker:font-mono marker:text-xs marker:text-muted-foreground">
                {m.steps.map((s) => (
                  <li key={s.booking.id}>
                    <span className={cn("mr-2 inline-block min-w-12 rounded border px-1 text-center font-mono text-[11px]", s.fits ? "text-ok" : "text-late")}>{s.fits ? "LOAD" : "BUMP"}</span>
                    {s.booking.item}{" "}
                    <span className="text-muted-foreground">· {s.fits ? `${loadReason(s.booking)} · ${num(s.massAfter)} kg on board` : bumpReason(s)}</span>
                  </li>
                ))}
              </ol>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
