"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon, ExternalLinkIcon, MaximizeIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Slide {
  label: string;
  time: string;
  say: string;
  body: ReactNode;
}

// Sizes are in container units (cqw), so a slide scales with its frame, windowed or full screen.
const H1 = "font-heading font-extrabold uppercase leading-[0.9] text-[6.4cqw]";
const H2 = "font-heading font-extrabold uppercase leading-[0.92] text-[4.4cqw]";
const EYEBROW = "label-caps text-[1.15cqw] text-primary";

function Point({ title, text, tag }: { title: string; text?: string; tag?: "AI" | "RULES" }) {
  return (
    <div className="grid content-start gap-[0.6cqw] rounded-[0.8cqw] border bg-background/50 p-[1.4cqw]">
      {tag && <span className={cn("w-fit rounded-sm border px-[0.6cqw] font-mono text-[0.95cqw] tracking-wider", tag === "AI" ? "text-primary" : "text-life")}>{tag}</span>}
      <span className="text-[1.9cqw] leading-tight font-semibold">{title}</span>
      {text && <span className="text-[1.35cqw] leading-snug text-muted-foreground">{text}</span>}
    </div>
  );
}

function Shot({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-[0.8cqw] border shadow-2xl", className)}>
      <Image src={`/screenshots/${src}`} alt={alt} width={1512} height={798} className="h-auto w-full" />
    </div>
  );
}

const SLIDES: Slide[] = [
  {
    label: "Title",
    time: "0:00",
    say: "Introduce the team in one sentence, then go straight to the story.",
    body: (
      <div className="grid h-full content-center gap-[2cqw]">
        <p className={EYEBROW}>IEEE Lumen 2.0 · Beyond 2030</p>
        <h1 className={cn(H1, "text-[9cqw]")}>Cargo Window</h1>
        <p className="max-w-[60%] text-[2.4cqw] leading-snug">Deciding what flies to the first bases on the Moon and Mars.</p>
      </div>
    ),
  },
  {
    label: "2035",
    time: "0:00–0:30",
    say: "It's 2035. People live at the Moon's south pole, and six of them live in Jezero crater on Mars. Everything they can't make comes up on a rocket.",
    body: (
      <div className="grid h-full content-center gap-[3cqw]">
        <p className={EYEBROW}>The future</p>
        <h2 className={cn(H2, "max-w-[80%]")}>It&apos;s 2035. Everything the bases can&apos;t make comes up on a rocket.</h2>
        <div className="grid grid-cols-3 gap-[1.5cqw]">
          <Point title="Moon base" text="A flight every four weeks." />
          <Point title="Mars outpost" text="Six people in Jezero crater." />
          <Point title="Already starting" text="NASA has bought commercial Moon cargo since 2018." />
        </div>
      </div>
    ),
  },
  {
    label: "Problem",
    time: "0:30–1:10",
    say: "Every rocket has fixed room and more cargo than space. On Earth a parcel that misses the truck goes tomorrow. To Mars, the next ship leaves in 26 months. Whoever writes the manifest decides who goes without.",
    body: (
      <div className="grid h-full content-center gap-[3cqw]">
        <p className={EYEBROW}>The problem</p>
        <h2 className={cn(H2, "text-[5.6cqw]")}>
          Miss the ship to Mars and you wait <span className="text-primary">26 months</span>.
        </h2>
        <div className="grid grid-cols-3 gap-[1.5cqw]">
          <Point title="Fixed room" text="More cargo is waiting than fits." />
          <Point title="Rare windows" text="Mars launches every 26 months." />
          <Point title="Slow link" text="44 minutes for a question and its answer." />
        </div>
      </div>
    ),
  },
  {
    label: "Solution",
    time: "1:10–1:35",
    say: "Cargo Window plans those flights. It measures every manifest in the days a base goes without, so a bid can never outrank someone's air.",
    body: (
      <div className="grid h-full grid-cols-[1fr_1.15fr] items-center gap-[3cqw]">
        <div className="grid gap-[2cqw]">
          <p className={EYEBROW}>Cargo Window</p>
          <h2 className={H2}>Survival first. Fair rules for the rest.</h2>
          <div className="grid gap-[1cqw]">
            <Point tag="AI" title="1 · Read the request" />
            <Point tag="RULES" title="2 · Approve and pack" />
            <Point tag="RULES" title="3 · See who goes short" />
          </div>
        </div>
        <Shot src="console.jpg" alt="The Cargo Window console with its three-step introduction, counters and launch timeline" />
      </div>
    ),
  },
  {
    label: "Demo",
    time: "1:35–4:10",
    say: "Switch to the console. Read the Sabatier request, approve it, show the rover fleet going red, then the two scenarios, then Write brief, then LN-14 on the Moon. The Pitch & demo page has the full click path.",
    body: (
      <div className="grid h-full grid-cols-[1fr_1.15fr] items-center gap-[3cqw]">
        <div className="grid justify-items-start gap-[2cqw]">
          <p className={EYEBROW}>Live demo</p>
          <h2 className={H2}>An urgent request from Mars</h2>
          <p className="text-[1.8cqw] leading-snug text-muted-foreground">The oxygen reactor is failing. Claude drafts the booking. We approve it. Watch who gets bumped.</p>
          <Link href="/console/" target="_blank" className={cn(buttonVariants({ size: "lg" }), "h-[4cqw] px-[2cqw] text-[1.5cqw]")}>
            Open the console <ExternalLinkIcon />
          </Link>
        </div>
        <Shot src="request-draft.jpg" alt="A booking draft read from the Sabatier reactor request" />
      </div>
    ),
  },
  {
    label: "Result",
    time: "during the demo",
    say: "If the live demo fails, use this slide: the reactor flies, the rover fleet is bumped 19 months, and when the crew grows the base goes 650 days short.",
    body: (
      <div className="grid h-full content-center gap-[2cqw]">
        <p className={EYEBROW}>What the demo shows</p>
        <div className="grid grid-cols-2 gap-[2cqw]">
          <div className="grid gap-[1cqw]">
            <Shot src="bumped.jpg" alt="The rover fleet bumped to the next Mars window, 19 months late" />
            <p className="text-[1.6cqw] leading-snug">Oxygen flies. The rover fleet waits 19 months.</p>
          </div>
          <div className="grid gap-[1cqw]">
            <Shot src="consequences.jpg" alt="Days a base goes short at 650, with late loads drawn in red on the timeline" />
            <p className="text-[1.6cqw] leading-snug">The crew grows. The base now goes 650 days short.</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    label: "Build",
    time: "4:10–4:35",
    say: "The planner is fixed rules, so Earth and Mars each compute the same manifest and confirm it with one short code, even with a 44-minute delay. Claude only reads requests and drafts messages. A person approves every booking.",
    body: (
      <div className="grid h-full content-center gap-[3cqw]">
        <p className={EYEBROW}>How it&apos;s built</p>
        <h2 className={H2}>AI reads and writes. Rules decide. People approve.</h2>
        <div className="grid grid-cols-3 gap-[1.5cqw]">
          <Point tag="RULES" title="Two copies, one plan" text="Earth and the base get the same 8-character fingerprint." />
          <Point tag="AI" title="Claude, kept honest" text="Every field checked. Missing numbers block the booking." />
          <Point title="Simple stack" text="Next.js, FastAPI, Claude API, one container." />
        </div>
      </div>
    ),
  },
  {
    label: "Close",
    time: "4:35–5:00",
    say: "Off Earth, a cargo manifest is part of life support. Cargo Window makes it fair, visible and fast to change. Thank you, we're happy to take questions.",
    body: (
      <div className="grid h-full content-center gap-[2cqw]">
        <h2 className={cn(H1, "max-w-[85%]")}>
          Off Earth, a cargo manifest is part of <span className="text-primary">life support</span>.
        </h2>
        <p className="max-w-[70%] text-[2.2cqw] leading-snug">Cargo Window makes it fair, visible and fast to change.</p>
        <p className="font-mono text-[1.3cqw] text-muted-foreground">Thank you · questions welcome</p>
      </div>
    ),
  },
];

export function PitchDeck() {
  const [index, setIndex] = useState(0);
  const frame = useRef<HTMLDivElement>(null);
  const go = useCallback((delta: number) => setIndex((i) => Math.min(SLIDES.length - 1, Math.max(0, i + delta))), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        go(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const slide = SLIDES[index];

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="label-caps text-xs text-muted-foreground">Pitch deck · five minutes · {SLIDES.length} slides</p>
          <h1 className="font-heading text-4xl font-extrabold tracking-wide uppercase">The full idea pitch</h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => frame.current?.requestFullscreen?.().catch(() => {})}>
          <MaximizeIcon /> Present full screen
        </Button>
      </div>

      <div
        ref={frame}
        className="relative mx-auto aspect-video w-full max-w-[calc((100vh-15rem)*16/9)] overflow-hidden rounded-xl border bg-background [container-type:inline-size] fullscreen:max-w-none fullscreen:rounded-none fullscreen:border-0"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,oklch(0.78_0.13_75/0.12),transparent_45%)]" />
        <div className="relative h-full px-[6cqw] py-[5cqw]">{slide.body}</div>
        <div className="absolute right-[2cqw] bottom-[1.5cqw] left-[2cqw] flex items-center justify-between font-mono text-[1cqw] text-muted-foreground">
          <span className="font-heading text-[1.4cqw] font-extrabold tracking-widest uppercase">Cargo Window</span>
          <span>
            {index + 1} / {SLIDES.length}
          </span>
        </div>
        {/* Large click targets on the slide edges, so the presenter can move without the controls below. */}
        <button type="button" aria-label="Previous slide" onClick={() => go(-1)} className="absolute inset-y-0 left-0 w-[8%] cursor-w-resize outline-none" />
        <button type="button" aria-label="Next slide" onClick={() => go(1)} className="absolute inset-y-0 right-0 w-[8%] cursor-e-resize outline-none" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => go(-1)} disabled={index === 0}>
            <ArrowLeftIcon /> Previous
          </Button>
          <Button onClick={() => go(1)} disabled={index === SLIDES.length - 1}>
            Next <ArrowRightIcon />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {SLIDES.map((s, i) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setIndex(i)}
              aria-current={i === index ? "step" : undefined}
              className={cn("rounded-md border px-2 py-1 font-mono text-xs transition-colors hover:border-ring/60", i === index ? "border-primary text-primary" : "text-muted-foreground")}
            >
              {i + 1} {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-1 rounded-lg border bg-card p-4">
        <p className="label-caps text-xs text-muted-foreground">
          What to say · <span className="font-mono tracking-normal normal-case">{slide.time}</span>
        </p>
        <p className="max-w-[80ch] text-lg">{slide.say}</p>
        <p className="mt-1 text-xs text-muted-foreground">Arrow keys, the Previous and Next buttons, or the slide&apos;s left and right edges move between slides. In full screen only the slide is shown.</p>
      </div>
    </div>
  );
}
