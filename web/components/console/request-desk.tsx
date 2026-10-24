"use client";

import { useState } from "react";
import { InboxIcon, Loader2Icon, SparklesIcon } from "lucide-react";
import { PriorityChip } from "@/components/console/priority-chip";
import { useServer } from "@/components/providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { aiFailedNote, api } from "@/lib/api";
import { BASES, d } from "@/lib/engine";
import { fmtDate, fmtVol, num } from "@/lib/format";
import { missingFields, normalizeDraft, readOffline, type Draft } from "@/lib/offline";
import { REQUESTS, type BookingRow } from "@/lib/scenario";
import { cn } from "@/lib/utils";

const listing = (items: string[]) => (items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`);

interface DraftState {
  data: Draft;
  source: "claude" | "offline";
  warn: string;
  booked: boolean;
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid min-w-0 gap-0.5", className)}>
      <dt className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">{label}</dt>
      <dd className="text-sm break-words">{children}</dd>
    </div>
  );
}

function MissingInput({ id, label, unit, type = "number", onValue }: { id: string; label: string; unit: string; type?: string; onValue: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor={id} className="sr-only">{label}</Label>
      <Input id={id} type={type} placeholder="Missing" className="h-7 border-late/60" onChange={(e) => onValue(e.target.value)} />
      <span className="text-xs text-muted-foreground">{unit}</span>
    </div>
  );
}

export function RequestDesk({ onBook }: { onBook: (row: BookingRow) => void }) {
  const server = useServer();
  const [sample, setSample] = useState<number | null>(0);
  const [text, setText] = useState(REQUESTS[0].text);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<DraftState | null>(null);

  async function read() {
    if (!text.trim()) return;
    setBusy(true);
    setDraft(null);
    let data: Draft | null = null;
    let warn = "";
    if (server.ai) {
      try {
        data = normalizeDraft(await api.intake(text.trim()));
      } catch (e) {
        warn = aiFailedNote(e);
      }
    }
    setDraft({ data: data ?? readOffline(text), source: data ? "claude" : "offline", warn, booked: false });
    setBusy(false);
  }

  const update = (patch: Partial<Draft>) => draft && setDraft({ ...draft, data: normalizeDraft({ ...draft.data, ...patch, questions: draft.data.questions }) });

  function approve() {
    if (!draft) return;
    const x = draft.data;
    if (missingFields(x).length || !x.destination) return;
    onBook([x.destination, x.item, x.shipper, x.priority, x.mass_kg!, x.volume_m3!, x.needed_by!, x.priority === "commercial" ? x.bid_usd_per_kg! : undefined]);
    setDraft({ ...draft, booked: true });
  }

  const x = draft?.data;
  const missing = x ? missingFields(x) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Badge variant="outline" className="border-primary/60 text-primary">Step 1</Badge>
          Base request desk
        </CardTitle>
        <CardDescription>A crew&apos;s message becomes a booking draft. You approve it; the planner decides where it flies.</CardDescription>
        <CardAction>
          <Badge variant="outline" className="gap-1 text-primary"><SparklesIcon /> AI</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <p className="text-sm text-muted-foreground">Try a sample request:</p>
          <div className="flex flex-wrap gap-2">
            {REQUESTS.map((r, i) => (
              <Button
                key={r.label}
                size="sm"
                variant={sample === i ? "secondary" : "outline"}
                onClick={() => {
                  setSample(i);
                  setText(r.text);
                  setDraft(null);
                }}
              >
                {r.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="request-text">Message from the base or shipper</Label>
          <Textarea
            id="request-text"
            rows={5}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setSample(null);
            }}
            className="font-mono text-[13px]"
            placeholder="Paste a request, for example from a base commander or a company."
          />
        </div>
        <Button onClick={read} disabled={busy || !text.trim()} className="justify-self-start">
          {busy ? <Loader2Icon className="animate-spin" /> : <InboxIcon />}
          {busy ? (server.ai ? "Claude is reading…" : "Reading…") : "Read request"}
        </Button>

        {draft && x && (
          <div className="grid gap-3 rounded-lg border bg-background/40 p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="label-caps text-xs text-muted-foreground">Booking draft</p>
              <span className={cn("font-mono text-xs", draft.source === "claude" ? "text-primary" : "text-muted-foreground")}>
                {draft.source === "claude" ? "Read by Claude" : "Read by the offline reader"}
              </span>
            </div>
            {draft.warn && <p className="text-xs text-primary">{draft.warn}</p>}
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
              <Field label="Load" className="col-span-2">{x.item}</Field>
              <Field label="Shipper">{x.shipper || <span className="text-late">Missing</span>}</Field>
              <Field label="Destination">{x.destination ? `${BASES[x.destination].name}, ${BASES[x.destination].body}` : <span className="text-late">Missing</span>}</Field>
              <Field label="Priority" className="col-span-2">
                <PriorityChip priority={x.priority} />
                {x.priority_reason && <span className="mt-0.5 block text-xs text-muted-foreground">{x.priority_reason}</span>}
              </Field>
              <Field label="Mass">
                {x.mass_kg != null ? `${num(x.mass_kg)} kg` : <MissingInput id="draft-mass" label="Mass in kilograms" unit="kg" onValue={(v) => update({ mass_kg: Number(v) })} />}
              </Field>
              <Field label="Volume">
                {x.volume_m3 != null ? fmtVol(x.volume_m3) : <MissingInput id="draft-vol" label="Volume in cubic metres" unit="m³" onValue={(v) => update({ volume_m3: Number(v) })} />}
              </Field>
              <Field label="Needed at base by">
                {x.needed_by ? fmtDate(d(x.needed_by)) : <MissingInput id="draft-date" label="Need date" unit="" type="date" onValue={(v) => update({ needed_by: v })} />}
              </Field>
              {x.priority === "commercial" && (
                <Field label="Bid">
                  {x.bid_usd_per_kg != null ? `$${num(x.bid_usd_per_kg)}/kg` : <MissingInput id="draft-bid" label="Bid per kilogram" unit="$/kg" onValue={(v) => update({ bid_usd_per_kg: Number(v) })} />}
                </Field>
              )}
            </dl>
            {x.questions.length > 0 && missing.length > 0 && (
              <div className="grid gap-1.5 rounded-md border border-dashed border-primary/60 p-3">
                <p className="label-caps text-xs text-primary">Send back in one message</p>
                <ol className="list-decimal space-y-1 pl-5 text-sm">
                  {x.questions.map((q) => <li key={q}>{q}</li>)}
                </ol>
                <p className="text-xs text-muted-foreground">Each question to Mars can cost a 44-minute round trip, so they all go at once. Or fill in the answers above.</p>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={approve} disabled={missing.length > 0 || draft.booked || !x.shipper}>
                {draft.booked ? "Booked" : "Approve and book"}
              </Button>
              <Button variant="ghost" onClick={() => setDraft(null)}>Discard</Button>
              {missing.length > 0 && <span className="text-xs text-muted-foreground">Blocked until {listing(missing)} {missing.length === 1 ? "is" : "are"} known. Nothing is guessed.</span>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
