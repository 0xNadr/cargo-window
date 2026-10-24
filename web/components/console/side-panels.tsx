"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon, Loader2Icon } from "lucide-react";
import { useServer } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { aiFailedNote, api } from "@/lib/api";
import type { Booking, Manifest, Plan } from "@/lib/engine";
import type { ChangeLine, Tone } from "@/lib/impact";
import { offlineBrief } from "@/lib/offline";
import { EVENTS } from "@/lib/scenario";
import { cn } from "@/lib/utils";

export interface Activity {
  id: number;
  title: string;
  lines: ChangeLine[];
}

const DOT: Record<Tone, string> = { good: "bg-ok", warn: "bg-warn", bad: "bg-late" };

export function WhatChanged({ activity }: { activity: Activity[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>What changed</CardTitle>
        <CardDescription>Every change to the plan, and what it did to everyone else&apos;s cargo.</CardDescription>
      </CardHeader>
      <CardContent>
        {activity.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing yet. Add a request from the inbox and this list explains who it affects.</p>
        ) : (
          <ol className="grid gap-4">
            {activity.map((a) => (
              <li key={a.id} className="grid gap-1.5">
                <p className="text-sm font-medium">{a.title}</p>
                <ul className="grid gap-1">
                  {a.lines.map((l, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", DOT[l.tone])} />
                      {l.text}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

export function UpdateMessage({ manifest, bookings, plan }: { manifest: Manifest; bookings: Booking[]; plan: Plan }) {
  const server = useServer();
  const sig = `${manifest.flight.id}|${manifest.loaded.map((b) => b.id).join(",")}|${manifest.bumped.map((b) => b.id).join(",")}`;
  const [result, setResult] = useState<{ sig: string; text: string; source: "claude" | "offline"; warn: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const current = result?.sig === sig ? result : null;

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
    setResult({ sig, text: text || offlineBrief(manifest, plan), source: text ? "claude" : "offline", warn });
    setBusy(false);
  }

  async function copy() {
    if (!current) return;
    try {
      await navigator.clipboard.writeText(current.text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // the text stays selectable in the box
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tell the people affected</CardTitle>
        <CardDescription>
          A ready-to-send update for {manifest.flight.id}: one note for the base commander and one line for every company whose cargo was moved.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="flex flex-wrap gap-2">
          <Button variant={current ? "outline" : "default"} onClick={write} disabled={busy}>
            {busy && <Loader2Icon className="animate-spin" />}
            {busy ? "Writing…" : current ? "Write it again" : "Write the update"}
          </Button>
          {current && (
            <Button variant="ghost" onClick={copy}>
              {copied ? <CheckIcon /> : <CopyIcon />} {copied ? "Copied" : "Copy"}
            </Button>
          )}
        </div>
        {current?.warn && <p className="text-xs text-warn">{current.warn}</p>}
        {current && (
          <>
            <pre className="max-h-80 overflow-auto rounded-lg border bg-muted/40 p-3 font-sans text-sm leading-relaxed whitespace-pre-wrap">{current.text}</pre>
            <p className="text-xs text-muted-foreground">{current.source === "claude" ? "Written by Claude from the plan's numbers." : "Written from a template (no AI key)."} Read it before you send it.</p>
          </>
        )}
        {result && !current && <p className="text-sm text-muted-foreground">The plan changed since the last update. Write it again.</p>}
      </CardContent>
    </Card>
  );
}

export function WhatIf({ applied, onApply }: { applied: number; onApply: (index: number) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Try what happens if…</CardTitle>
        <CardDescription>Events at Ares Outpost. Apply them in order and watch the plan react.</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="grid gap-4">
          {EVENTS.map((e, i) => {
            const done = i < applied;
            return (
              <li key={e.title} className="flex items-start justify-between gap-3">
                <div className="grid gap-0.5">
                  <span className="text-sm font-medium">{e.title}</span>
                  <span className="text-sm text-muted-foreground">{e.detail}</span>
                </div>
                {done ? (
                  <span className="inline-flex items-center gap-1 pt-0.5 text-xs text-muted-foreground">
                    <CheckIcon className="size-3.5" /> Done
                  </span>
                ) : (
                  <Button size="sm" variant="outline" disabled={i !== applied} onClick={() => onApply(i)}>
                    Apply
                  </Button>
                )}
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
