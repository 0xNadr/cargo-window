"use client";

import { useGuide } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const GUIDE_STEPS = [
  {
    title: "A request comes in",
    body: 'Crews write what they need in their own words. Pick a sample in the request desk or paste a message, then click "Read request". Claude turns it into a booking draft and lists anything missing.',
  },
  {
    title: "You approve it",
    body: 'Check the draft and click "Approve and book". Nothing is booked without you, and a draft with missing numbers stays blocked.',
  },
  {
    title: "The planner packs every flight",
    body: "Fixed rules decide what flies: life-critical first, then mission-critical, then commercial by bid. A load that doesn't fit moves to the next flight to the same base.",
  },
  {
    title: "You check the cost",
    body: 'Pick a flight to see its manifest. Red means a load now arrives after the base needs it. "Days a base goes short" adds that up for everything the crew and base depend on.',
  },
  {
    title: "You tell the people affected",
    body: '"Write brief" drafts the note to the base commander and a message to each bumped shipper. You check it before sending.',
  },
];

const LEGEND = [
  ["bg-life", "P1 Life-critical: air, water, food, medicine. Never bumped by anything else."],
  ["bg-mission", "P2 Mission-critical: keeps the base working, such as power and repairs."],
  ["bg-commercial", "P3 Commercial: company cargo, ordered by bid per kilogram."],
] as const;

export function GuideDialog() {
  const { open, setOpen } = useGuide();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-3xl font-semibold tracking-tight">How Cargo Window works</DialogTitle>
          <DialogDescription>
            Every rocket to the Moon or Mars has fixed room, and more cargo is waiting than fits. Cargo Window decides what flies and shows what each
            decision costs the people waiting for it. A ship to Mars only leaves about every 26 months.
          </DialogDescription>
        </DialogHeader>
        <ol className="grid gap-3">
          {GUIDE_STEPS.map((s, i) => (
            <li key={s.title} className="grid grid-cols-[2rem_1fr] gap-x-3">
              <span className="row-span-2 font-heading text-3xl leading-none font-semibold text-primary tracking-tight">{i + 1}</span>
              <span className="font-semibold">{s.title}</span>
              <span className="text-sm text-muted-foreground">{s.body}</span>
            </li>
          ))}
        </ol>
        <div className="grid gap-2 rounded-lg border p-3">
          <p className="label-caps text-xs text-muted-foreground">Colours on the board</p>
          {LEGEND.map(([swatch, text]) => (
            <p key={swatch} className="flex items-start gap-2 text-sm">
              <span className={`mt-1.5 size-2.5 shrink-0 rounded-sm ${swatch}`} />
              {text}
            </p>
          ))}
          <p className="flex items-start gap-2 text-sm">
            <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-late" />
            Red: arrives after the base needs it. Blue: moved to a later flight but still on time. Green: on time.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          The <span className="font-mono text-primary">fingerprint</span> under each manifest is a short code computed from its loads. The Earth server and
          this browser each compute it; when they match, both copies of the plan agree, even if the base is 22 light-minutes away.
        </p>
        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
