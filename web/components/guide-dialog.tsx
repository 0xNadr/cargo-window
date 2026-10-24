"use client";

import { BrandLogo } from "@/components/brand-logo";
import { useGuide } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const STEPS = [
  {
    title: "Open a request in the inbox",
    body: "Bases and companies write what they need in their own words, like an email.",
  },
  {
    title: "Turn it into a booking",
    body: "Click \"Turn into a booking\". Claude fills in what it is, how heavy, and when it's needed. If something is missing, it lists the questions to send back.",
  },
  {
    title: "Check it and add it to the plan",
    body: "Nothing is added without you. Once added, the plan decides which rocket it goes on.",
  },
  {
    title: "See what it changed",
    body: "\"What changed\" tells you in plain words who had to wait because of it. The message at the top says whether any base will go short.",
  },
  {
    title: "Tell the people affected",
    body: "\"Write the update\" drafts the note to the base commander and every company whose cargo moved. Read it, then send it.",
  },
];

const RULES = [
  ["bg-life", "Keeps the crew alive", "Air, water, food, medicine. Always loaded first."],
  ["bg-mission", "Keeps the base running", "Power, repairs, greenhouses. Loaded next."],
  ["bg-commercial", "Paid cargo from companies", "Fills the space that's left, highest offer first."],
] as const;

export function GuideDialog() {
  const { open, setOpen } = useGuide();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[92vh] grid-rows-[auto_minmax(0,1fr)_auto] gap-4 p-5 sm:max-w-[45rem]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 text-xl font-semibold tracking-tight">
            <BrandLogo size={30} /> How the cargo desk works
          </DialogTitle>
          <DialogDescription>
            Every rocket to the Moon or Mars has a weight limit, and more cargo is waiting than fits. You decide what goes. A rocket to Mars only leaves about
            every 26 months, so anything that misses it waits two years.
          </DialogDescription>
        </DialogHeader>
        {/* On a very short screen only the middle scrolls, so the title and "Got it" stay in view. */}
        <div className="-mx-5 grid content-start gap-4 overflow-y-auto px-5">
          <ol className="grid gap-2.5">
            {STEPS.map((s, i) => (
              <li key={s.title} className="grid grid-cols-[1.75rem_1fr] gap-x-2 leading-snug">
                <span className="row-span-2 mt-px flex size-6 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">{i + 1}</span>
                <span className="font-medium">{s.title}</span>
                <span className="text-sm text-muted-foreground">{s.body}</span>
              </li>
            ))}
          </ol>
          <div className="grid gap-3 rounded-lg border p-3">
            <p className="text-sm font-medium">The order things are loaded</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {RULES.map(([swatch, name, text]) => (
                <p key={swatch} className="grid grid-cols-[0.625rem_1fr] gap-x-2 text-sm leading-snug">
                  <span className={`mt-1 size-2.5 rounded-full ${swatch}`} />
                  <span className="font-medium">{name}</span>
                  <span className="col-start-2 text-muted-foreground">{text}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-md text-sm text-muted-foreground">
            Anything that doesn&apos;t fit waits for the next rocket to the same base. Paying more never puts cargo ahead of what keeps people alive.
          </p>
          <Button onClick={() => setOpen(false)}>Got it</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
