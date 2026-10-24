"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon, DownloadIcon, ExternalLinkIcon, Loader2Icon, MaximizeIcon } from "lucide-react";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand-logo";
import { ThemedScreenshot } from "@/components/themed-screenshot";
import { Button, buttonVariants } from "@/components/ui/button";
import { DECK, splitAccent, type DeckPoint, type DeckSlide } from "@/lib/deck";
import { downloadDeckAsPowerPoint } from "@/lib/deck-pptx";
import { cn } from "@/lib/utils";

// Sizes are in container units (cqw), so a slide scales with its frame, windowed or full screen.
const KICKER = "text-[1.3cqw] font-medium text-primary";
const TITLE = "font-heading font-semibold tracking-tight leading-[1.05]";

function Accented({ text, accent }: { text: string; accent?: string }) {
  const [before, hit, after] = splitAccent(text, accent);
  return (
    <>
      {before}
      {hit && <span className="text-mars">{hit}</span>}
      {after}
    </>
  );
}

function Point({ point, compact = false }: { point: DeckPoint; compact?: boolean }) {
  return (
    <div className={cn("grid content-start gap-[0.6cqw] rounded-[0.8cqw] border bg-background/50", compact ? "px-[1.4cqw] py-[1cqw]" : "p-[1.6cqw]")}>
      {point.tag && (
        <span className={cn("w-fit rounded-sm border px-[0.6cqw] font-mono text-[0.95cqw] tracking-wider", point.tag === "AI" ? "text-primary" : "text-life")}>{point.tag}</span>
      )}
      <span className="text-[1.9cqw] leading-tight font-semibold">{point.title}</span>
      {point.text && <span className="text-[1.4cqw] leading-snug text-muted-foreground">{point.text}</span>}
    </div>
  );
}

function Shot({ src, alt }: { src: string; alt: string }) {
  return <ThemedScreenshot name={src} alt={alt} className="rounded-[0.8cqw] border shadow-2xl" />;
}

function SlideBody({ slide }: { slide: DeckSlide }) {
  switch (slide.kind) {
    case "title":
      return (
        <div className="grid h-full grid-cols-[1fr_auto] items-center gap-[4cqw]">
          <div className="grid gap-[2cqw]">
            <p className={KICKER}>{slide.kicker}</p>
            <h1 className={cn(TITLE, "text-[8.5cqw]")}>{slide.title}</h1>
            <p className="max-w-[90%] text-[2.4cqw] leading-snug">{slide.subtitle}</p>
          </div>
          <BrandLogo size={512} className="h-auto w-[24cqw]" priority />
        </div>
      );
    case "points":
      return (
        <div className="grid h-full content-center gap-[3cqw]">
          <p className={KICKER}>{slide.kicker}</p>
          <h2 className={cn(TITLE, "max-w-[85%] text-[4.6cqw]")}>
            <Accented text={slide.title} accent={slide.accent} />
          </h2>
          <div className="grid gap-[1.5cqw]" style={{ gridTemplateColumns: `repeat(${slide.points.length}, minmax(0, 1fr))` }}>
            {slide.points.map((p) => <Point key={p.title} point={p} />)}
          </div>
        </div>
      );
    case "split":
      return (
        <div className="grid h-full grid-cols-[1fr_1.15fr] items-center gap-[3cqw]">
          <div className="grid justify-items-start gap-[1.8cqw]">
            <p className={KICKER}>{slide.kicker}</p>
            <h2 className={cn(TITLE, "text-[4cqw]")}>{slide.title}</h2>
            {slide.text && <p className="text-[1.8cqw] leading-snug text-muted-foreground">{slide.text}</p>}
            {slide.points && (
              <div className="grid w-full gap-[1cqw]">
                {slide.points.map((p) => <Point key={p.title} point={p} compact />)}
              </div>
            )}
            {slide.link && (
              <Link href={slide.link.href} target="_blank" className={cn(buttonVariants({ size: "lg" }), "h-[4cqw] px-[2cqw] text-[1.5cqw]")}>
                {slide.link.label} <ExternalLinkIcon />
              </Link>
            )}
          </div>
          <Shot src={slide.image} alt={slide.imageAlt} />
        </div>
      );
    case "shots":
      return (
        <div className="grid h-full content-center gap-[2cqw]">
          <p className={KICKER}>{slide.kicker}</p>
          <div className="grid grid-cols-2 gap-[2cqw]">
            {slide.shots.map((s) => (
              <div key={s.image} className="grid gap-[1cqw]">
                <Shot src={s.image} alt={s.alt} />
                <p className="text-[1.6cqw] leading-snug">{s.caption}</p>
              </div>
            ))}
          </div>
        </div>
      );
    case "close":
      return (
        <div className="grid h-full content-center gap-[2cqw]">
          <h2 className={cn(TITLE, "max-w-[85%] text-[6cqw]")}>
            <Accented text={slide.title} accent={slide.accent} />
          </h2>
          <p className="max-w-[70%] text-[2.2cqw] leading-snug">{slide.subtitle}</p>
          <p className="text-[1.3cqw] text-muted-foreground">{slide.footnote}</p>
        </div>
      );
  }
}

export function PitchDeck() {
  const [index, setIndex] = useState(0);
  const [exporting, setExporting] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  const go = useCallback((delta: number) => setIndex((i) => Math.min(DECK.length - 1, Math.max(0, i + delta))), []);

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

  async function exportPowerPoint() {
    setExporting(true);
    try {
      await downloadDeckAsPowerPoint();
      toast.success("PowerPoint downloaded", { description: "Cargo-Window-pitch.pptx, with speaker notes on every slide." });
    } catch {
      toast.error("The PowerPoint couldn't be built", { description: "Reload the page and try again." });
    } finally {
      setExporting(false);
    }
  }

  /** Full screen; on a phone also turns to landscape where the browser allows it (Android does, iOS doesn't). */
  function present() {
    const orientation = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
    frame.current
      ?.requestFullscreen?.()
      .then(() => orientation.lock?.("landscape"))
      .catch(() => {});
  }

  const slide = DECK[index];

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Pitch deck · five minutes · {DECK.length} slides</p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">The full idea pitch</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={exportPowerPoint} disabled={exporting}>
            {exporting ? <Loader2Icon className="animate-spin" /> : <DownloadIcon />} Download PowerPoint
          </Button>
          <Button variant="outline" size="sm" onClick={present}>
            <MaximizeIcon /> Present full screen
          </Button>
        </div>
      </div>

      <div
        ref={frame}
        className="relative mx-auto aspect-video w-full max-w-[calc((100vh-21rem)*16/9)] overflow-hidden rounded-xl border bg-background [container-type:inline-size] fullscreen:max-w-none fullscreen:rounded-none fullscreen:border-0"
      >
        <div className="glow-corner absolute inset-0" />
        <div className="relative h-full px-[6cqw] py-[5cqw]">
          <SlideBody slide={slide} />
        </div>
        <div className="absolute right-[2cqw] bottom-[1.5cqw] left-[2cqw] flex items-center justify-between text-[1cqw] text-muted-foreground">
          <span className="flex items-center gap-[0.8cqw] text-[1.3cqw] font-semibold">
            <BrandLogo size={64} className="h-auto w-[2.4cqw]" /> Cargo Window
          </span>
          <span className="font-mono">
            {index + 1} / {DECK.length}
          </span>
        </div>
        {/* Large click targets on the slide edges, so the presenter can move without the controls below. */}
        <button type="button" aria-label="Previous slide" onClick={() => go(-1)} className="absolute inset-y-0 left-0 w-[8%] cursor-w-resize outline-none" />
        <button type="button" aria-label="Next slide" onClick={() => go(1)} className="absolute inset-y-0 right-0 w-[8%] cursor-e-resize outline-none" />
      </div>

      <p className="text-xs text-muted-foreground sm:hidden">On a phone, turn it sideways or press Present full screen to read the slides.</p>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => go(-1)} disabled={index === 0}>
            <ArrowLeftIcon /> Previous
          </Button>
          <Button onClick={() => go(1)} disabled={index === DECK.length - 1}>
            Next <ArrowRightIcon />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {DECK.map((s, i) => (
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
        <p className="text-sm text-muted-foreground">
          What to say · <span className="font-mono">{slide.time}</span>
        </p>
        <p className="max-w-[80ch] text-lg">{slide.say}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Arrow keys, Previous and Next, or the slide&apos;s left and right edges move between slides. In full screen only the slide is shown. The PowerPoint has the same slides, with this text as speaker notes.
        </p>
      </div>
    </div>
  );
}
