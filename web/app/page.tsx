import Link from "next/link";
import { ArrowRightIcon, ClockIcon, InboxIcon, RadioTowerIcon, ScaleIcon, ShieldCheckIcon, SparklesIcon, WeightIcon } from "lucide-react";
import { GuideButton } from "@/components/guide-button";
import { HeroTimeline } from "@/components/hero-timeline";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const FACTS = [
  ["26", "months", "between launch windows to Mars"],
  ["~7", "months", "for cargo to get there"],
  ["44", "min", "for a question and its answer"],
  ["0", "spare rockets", "when a flight is full"],
];

const PROBLEM = [
  { icon: WeightIcon, title: "Fixed room", text: "Every rocket carries a set mass and volume. In 2035 more cargo is waiting than any flight can take, so someone has to choose." },
  { icon: ClockIcon, title: "Rare windows", text: "To the Moon there's a flight every few weeks. To Mars the planets only line up every 26 months. A bumped load can mean two years without it." },
  { icon: RadioTowerIcon, title: "A slow link", text: "Messages to Mars take up to 22 minutes each way. Every back-and-forth about a request costs the crew time they don't have." },
];

const STEPS = [
  { icon: InboxIcon, kind: "AI", title: "Read the request", text: "A crew writes what they need in plain words. Claude turns it into a booking draft and asks every missing question in one message." },
  { icon: ScaleIcon, kind: "RULES", title: "Approve and pack", text: "A cargo officer approves. Fixed, published rules fill every flight: life-critical first, mission-critical next, commercial cargo by bid." },
  { icon: ShieldCheckIcon, kind: "RULES", title: "See the cost", text: "Every load is checked against the day its base needs it. Late loads turn red, months before launch, with who goes short and for how long." },
];

const DIFFERENT = [
  ["Measured in days without", "A manifest is judged by how long a base goes short, not by kilograms carried or money earned."],
  ["Money can't outrank survival", "Bids only order commercial cargo. Air, water, food and medicine always fly first."],
  ["Two planets, one plan", "The rules give the same answer every time, so Earth and a base compute the same manifest and confirm it with an 8-character fingerprint."],
  ["Built for delay", "One message in, one reply out: the request desk gathers everything missing at once and keeps working offline."],
];

const AUDIENCE = ["Base crews", "Base commanders", "Cargo officers on Earth", "Flight operators", "Companies shipping cargo"];

export default function LandingPage() {
  return (
    <div className="grid gap-24 pt-6">
      <section className="grid gap-8">
        <div className="grid gap-6">
          <p className="label-caps text-xs text-primary">Cargo planning for the first bases on the Moon and Mars · 2035</p>
          <h1 className="max-w-[14ch] font-heading text-6xl leading-[0.9] font-extrabold uppercase sm:text-8xl">
            Miss the ship to Mars and you wait <span className="text-primary">26&nbsp;months</span>.
          </h1>
          <p className="max-w-[60ch] text-xl text-muted-foreground">
            Cargo Window decides what flies to off-world bases. <strong className="font-semibold text-foreground">Survival first, fair rules for the rest,</strong> and every
            consequence visible before launch, not after the ship lands without it.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/console/" className={cn(buttonVariants({ size: "lg" }), "h-11 px-5 text-base")}>
              Open the console <ArrowRightIcon />
            </Link>
            <GuideButton />
          </div>
        </div>
        <HeroTimeline />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {FACTS.map(([n, unit, text]) => (
            <div key={text} className="border-l-2 border-primary/60 pl-4">
              <p className="font-heading text-5xl leading-none font-extrabold tabular-nums">
                {n}
                <small className="ml-1.5 text-xl text-muted-foreground">{unit}</small>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-8">
        <div className="grid max-w-3xl gap-3">
          <p className="label-caps text-xs text-muted-foreground">The problem</p>
          <h2 className="font-heading text-4xl leading-none font-extrabold uppercase sm:text-5xl">On Earth a missed truck costs a day. Off Earth it can cost a crew two years.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {PROBLEM.map(({ icon: Icon, title, text }) => (
            <Card key={title} className="gap-3 p-5">
              <Icon className="size-6 text-primary" />
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-muted-foreground">{text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-8">
        <div className="grid max-w-3xl gap-3">
          <p className="label-caps text-xs text-muted-foreground">How it works</p>
          <h2 className="font-heading text-4xl leading-none font-extrabold uppercase sm:text-5xl">AI reads and writes. Rules decide. People approve.</h2>
        </div>
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, kind, title, text }, i) => (
            <li key={title}>
              <Card className="h-full gap-3 p-5">
                <div className="flex items-center justify-between">
                  <span className="font-heading text-5xl leading-none font-extrabold text-primary">{i + 1}</span>
                  <span className={cn("inline-flex items-center gap-1 rounded-sm border px-1.5 font-mono text-[11px] tracking-wider", kind === "AI" ? "text-primary" : "text-life")}>
                    {kind === "AI" && <SparklesIcon className="size-3" />} {kind}
                  </span>
                </div>
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <Icon className="size-5 text-muted-foreground" /> {title}
                </h3>
                <p className="text-muted-foreground">{text}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-start">
        <div className="grid gap-3">
          <p className="label-caps text-xs text-muted-foreground">What makes it different</p>
          <h2 className="font-heading text-4xl leading-none font-extrabold uppercase sm:text-5xl">A cargo plan you can trust from two planets away</h2>
          <p className="text-muted-foreground">
            Freight software ranks cargo by price and assumes a live connection. Neither holds once the people waiting are 225 million kilometres away.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {AUDIENCE.map((a) => (
              <span key={a} className="rounded-full border px-3 py-1 text-sm text-muted-foreground">{a}</span>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {DIFFERENT.map(([title, text]) => (
            <Card key={title} className="gap-2 p-5">
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <Card className="items-start gap-4 border-primary/50 bg-primary/10 p-8 sm:p-10">
          <h2 className="max-w-[22ch] font-heading text-4xl leading-none font-extrabold uppercase sm:text-5xl">Run the cargo desk on 2 May 2035</h2>
          <p className="max-w-[60ch] text-muted-foreground">
            The console opens on a real-looking scenario: a Moon base, a Mars outpost and two crowded rockets. Read a crew&apos;s urgent request, approve it, and watch
            who gets bumped and what it costs them.
          </p>
          <Link href="/console/" className={cn(buttonVariants({ size: "lg" }), "h-11 px-5 text-base")}>
            Open the console <ArrowRightIcon />
          </Link>
        </Card>
        <p className="mt-6 text-xs text-muted-foreground/80">
          Example scenario: bases, companies, people, prices and capacities are invented. Mars launch timing, trip length and signal delay follow real orbital mechanics.
        </p>
      </section>
    </div>
  );
}
