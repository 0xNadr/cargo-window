"use client";

import { useState } from "react";
import { CheckIcon, Loader2Icon, PencilLineIcon } from "lucide-react";
import { PriorityChip } from "@/components/console/priority-chip";
import { useServer } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { aiFailedNote, api } from "@/lib/api";
import { BASES, d } from "@/lib/engine";
import { fmtDay, num } from "@/lib/format";
import { missingFields, normalizeDraft, readOffline, type Draft } from "@/lib/offline";
import type { BookingRow, InboxMessage } from "@/lib/scenario";
import { cn } from "@/lib/utils";

const NEW = "new";
const listing = (items: string[]) => (items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`);

interface DraftState {
  data: Draft;
  source: "claude" | "offline";
  warn: string;
}

function Field({ label, children, wide = false }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={cn("grid min-w-0 gap-0.5", wide && "col-span-2")}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm break-words">{children}</dd>
    </div>
  );
}

function Missing({ id, label, unit, type = "number", onValue }: { id: string; label: string; unit?: string; type?: string; onValue: (v: string) => void }) {
  return (
    <span className="flex items-center gap-2">
      <Label htmlFor={id} className="sr-only">{label}</Label>
      <Input id={id} type={type} placeholder="Missing" className="h-8 border-late/60" onChange={(e) => onValue(e.target.value)} />
      {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
    </span>
  );
}

export function Inbox({
  messages,
  read,
  booked,
  onOpen,
  onBook,
}: {
  messages: InboxMessage[];
  read: Set<string>;
  booked: Map<string, string>;
  onOpen: (id: string) => void;
  onBook: (row: BookingRow, messageId: string) => void;
}) {
  const server = useServer();
  const [openId, setOpenId] = useState<string>(messages[0]?.id ?? NEW);
  const [ownText, setOwnText] = useState("");
  const [busy, setBusy] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, DraftState>>({});

  const open = messages.find((m) => m.id === openId);
  const text = open ? open.text : ownText;
  const draft: DraftState | undefined = drafts[openId];
  const x = draft?.data;
  const missing = x ? missingFields(x) : [];
  const done = booked.get(openId);

  function select(id: string) {
    setOpenId(id);
    if (id !== NEW) onOpen(id);
  }

  async function readMessage() {
    if (!text.trim()) return;
    if (openId !== NEW) onOpen(openId);
    setBusy(true);
    let data: Draft | null = null;
    let warn = "";
    if (server.ai) {
      try {
        data = normalizeDraft(await api.intake(text.trim()));
      } catch (e) {
        warn = aiFailedNote(e);
      }
    }
    setDrafts({ ...drafts, [openId]: { data: data ?? readOffline(text), source: data ? "claude" : "offline", warn } });
    setBusy(false);
  }

  const update = (patch: Partial<Draft>) => draft && x && setDrafts({ ...drafts, [openId]: { ...draft, data: normalizeDraft({ ...x, ...patch, questions: x.questions }) } });

  function approve() {
    if (!x || missing.length || !x.destination || !x.shipper) return;
    onBook([x.destination, x.item, x.shipper, x.priority, x.mass_kg!, x.volume_m3!, x.needed_by!, x.priority === "commercial" ? x.bid_usd_per_kg! : undefined], openId);
  }

  return (
    <div className="grid gap-6 md:grid-cols-[17rem_minmax(0,1fr)]">
      <nav aria-label="Messages" className="grid content-start gap-1">
        {messages.map((m) => {
          const unread = !read.has(m.id);
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => select(m.id)}
              aria-current={m.id === openId ? "true" : undefined}
              className={cn("grid gap-0.5 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted", m.id === openId && "bg-muted")}
            >
              <span className="flex items-center gap-2 text-sm">
                {unread && <span className="size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
                {booked.has(m.id) && <CheckIcon className="size-3.5 shrink-0 text-ok" aria-label="Booked" />}
                <span className={cn("truncate", unread && "font-semibold")}>{m.from}</span>
              </span>
              <span className="truncate text-sm text-muted-foreground">{m.subject}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => select(NEW)}
          className={cn("mt-1 flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground", openId === NEW && "bg-muted text-foreground")}
        >
          <PencilLineIcon className="size-4" /> Paste a request of your own
        </button>
      </nav>

      <div className="grid min-w-0 content-start gap-4">
        {open ? (
          <article className="grid gap-3 rounded-lg border p-4">
            <header className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="font-semibold">{open.subject}</p>
                <p className="text-sm text-muted-foreground">From {open.from}</p>
              </div>
              <span className="text-xs text-muted-foreground">
                {open.urgent && <span className="mr-2 font-medium text-late">Urgent</span>}
                {open.received}
              </span>
            </header>
            <p className="text-[15px] leading-relaxed whitespace-pre-line">{open.text}</p>
          </article>
        ) : (
          <div className="grid gap-1.5">
            <Label htmlFor="own-request">Paste a message from a base or a company</Label>
            <Textarea id="own-request" rows={5} value={ownText} onChange={(e) => setOwnText(e.target.value)} placeholder="For example, what they need, how heavy it is and by when." />
          </div>
        )}

        {done ? (
          <p className="flex items-start gap-2 rounded-lg border border-ok/30 bg-ok/5 p-4 text-sm">
            <CheckIcon className="mt-0.5 size-4 shrink-0 text-ok" />
            <span>{done}</span>
          </p>
        ) : !x ? (
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={readMessage} disabled={busy || !text.trim()}>
              {busy && <Loader2Icon className="animate-spin" />}
              {busy ? "Reading the message…" : "Turn into a booking"}
            </Button>
            <span className="text-sm text-muted-foreground">
              {server.ai ? "Claude fills in the booking for you. You check it before anything is added." : "The booking is filled in for you. You check it before anything is added."}
            </span>
          </div>
        ) : (
          <section className="grid gap-4 rounded-lg border bg-muted/30 p-4" aria-label="Booking draft">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-semibold">Check the booking</h3>
              <span className="text-xs text-muted-foreground">{draft.source === "claude" ? "Filled in by Claude" : "Filled in automatically (offline)"}</span>
            </div>
            {draft.warn && <p className="text-xs text-warn">{draft.warn}</p>}
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
              <Field label="What" wide>{x.item}</Field>
              <Field label="Sent by">{x.shipper || <span className="text-late">Missing</span>}</Field>
              <Field label="Goes to">{x.destination ? `${BASES[x.destination].name}, ${BASES[x.destination].body}` : <span className="text-late">Missing</span>}</Field>
              <Field label="Type of cargo" wide>
                <PriorityChip priority={x.priority} />
                {x.priority_reason && <span className="mt-0.5 block text-xs text-muted-foreground">{x.priority_reason}</span>}
              </Field>
              <Field label="Weight">{x.mass_kg != null ? `${num(x.mass_kg)} kg` : <Missing id="draft-mass" label="Weight in kilograms" unit="kg" onValue={(v) => update({ mass_kg: Number(v) })} />}</Field>
              <Field label="Space">{x.volume_m3 != null ? `${x.volume_m3} m³` : <Missing id="draft-vol" label="Space in cubic metres" unit="m³" onValue={(v) => update({ volume_m3: Number(v) })} />}</Field>
              <Field label="Needed at the base by">{x.needed_by ? fmtDay(d(x.needed_by)) : <Missing id="draft-date" label="Date needed" type="date" onValue={(v) => update({ needed_by: v })} />}</Field>
              {x.priority === "commercial" && (
                <Field label="Offer per kg">{x.bid_usd_per_kg != null ? `$${num(x.bid_usd_per_kg)}` : <Missing id="draft-bid" label="Offer per kilogram" unit="$" onValue={(v) => update({ bid_usd_per_kg: Number(v) })} />}</Field>
              )}
            </dl>
            {missing.length > 0 && (
              <div className="grid gap-1.5 rounded-md border border-dashed border-primary/60 bg-background/60 p-3 text-sm">
                <p className="font-medium">Ask the sender in one message</p>
                <ol className="list-decimal space-y-0.5 pl-5">
                  {x.questions.map((q) => <li key={q}>{q}</li>)}
                </ol>
                <p className="text-xs text-muted-foreground">A question to Mars and its answer can take 44 minutes, so everything missing is asked at once. If you already know the answers, type them in above.</p>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={approve} disabled={missing.length > 0 || !x.shipper}>Add to the plan</Button>
              <Button variant="ghost" onClick={() => setDrafts(Object.fromEntries(Object.entries(drafts).filter(([id]) => id !== openId)))}>Discard</Button>
              {missing.length > 0 && <span className="text-xs text-muted-foreground">Waiting for {listing(missing)}. Nothing is guessed.</span>}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
