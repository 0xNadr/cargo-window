"use client";

import { useState } from "react";
import { XIcon } from "lucide-react";
import { useGuide } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocalStorage } from "@/lib/use-local-storage";

const KEY = "cargo-window-intro-hidden";

const STEPS = [
  ["Read a request", "Pick a sample or paste a crew's message. Claude drafts the booking and lists what's missing."],
  ["Approve and book", "You check the draft. The planner packs every flight by fixed rules: survival first, money last."],
  ["Check what flies", "Pick a flight. Red loads arrive after the base needs them; the brief tells the people affected."],
] as const;

export function IntroStrip() {
  const guide = useGuide();
  const [stored, setStored] = useLocalStorage(KEY);
  const [hiddenNow, setHiddenNow] = useState(false);

  if (stored === "1" || hiddenNow) return null;

  const hide = () => {
    setHiddenNow(true);
    setStored("1");
  };

  return (
    <Card className="relative gap-4 border-primary/40 p-5">
      <Button variant="ghost" size="icon-sm" className="absolute top-2 right-2" onClick={hide} aria-label="Hide this introduction">
        <XIcon />
      </Button>
      <div className="max-w-3xl pr-8">
        <p className="label-caps text-xs text-primary">How to use Cargo Window</p>
        <p className="mt-1 text-lg">
          Every rocket to the Moon or Mars has fixed room and more cargo waiting than fits. Miss the ship to Mars and the next one leaves in
          26 months. This console decides what flies and shows who pays for it.
        </p>
      </div>
      <ol className="grid gap-3 sm:grid-cols-3">
        {STEPS.map(([title, body], i) => (
          <li key={title} className="grid grid-cols-[2rem_1fr] gap-x-2 rounded-lg border bg-background/40 p-3">
            <span className="row-span-2 font-heading text-3xl leading-none font-extrabold text-primary">{i + 1}</span>
            <span className="font-semibold">{title}</span>
            <span className="text-sm text-muted-foreground">{body}</span>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => guide.setOpen(true)}>
          Read the full guide
        </Button>
        <Button size="sm" variant="ghost" onClick={hide}>
          Got it, hide this
        </Button>
      </div>
    </Card>
  );
}
