import Link from "next/link";
import { ArrowRightIcon, ClockIcon, FingerprintIcon, InboxIcon, RadioTowerIcon, ScaleIcon, ShieldCheckIcon, TimerIcon, WeightIcon } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { HeroTimeline } from "@/components/hero-timeline";
import { ThemedScreenshot } from "@/components/themed-screenshot";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATS = [
  ["26 months", "between launch windows to Mars"],
  ["7 months", "for cargo to get there"],
  ["44 minutes", "for a question and its answer"],
  ["0 spare rockets", "when a flight is full"],
];

const PROBLEM = [
  { icon: WeightIcon, title: "Fixed room", text: "Every rocket carries a set mass and volume, and more cargo is waiting than any flight can take." },
  { icon: ClockIcon, title: "Rare windows", text: "The Moon has a flight every few weeks. Mars lines up every 26 months, so a bumped load can mean two years without it." },
  { icon: RadioTowerIcon, title: "A slow link", text: "Messages to Mars take up to 22 minutes each way. Every back-and-forth costs the crew time." },
];

const STEPS = [
  {
    icon: InboxIcon,
    step: "Step 1",
    title: "Turn a request into a booking",
    text: "A crew writes what they need in plain words. Claude turns the message into a booking draft, works out when the base runs out, and lists every missing detail in one reply.",
    points: ["Nothing is guessed: missing numbers block the booking", "A cargo officer checks every booking"],
    image: "request-draft",
    alt: "A booking filled in from a crew's request for a replacement oxygen reactor",
  },
  {
    icon: ScaleIcon,
    step: "Step 2",
    title: "Pack every flight by fixed rules",
    text: "Life-critical cargo flies first, then what keeps the base running, then commercial cargo by bid. A load that doesn't fit moves to the next flight, with the reason shown.",
    points: ["Money only orders commercial cargo", "The same bookings always give the same manifest"],
    image: "bumped",
    alt: "The rover fleet bumped to the next Mars window and marked 19 months late",
  },
  {
    icon: ShieldCheckIcon,
    step: "Step 3",
    title: "See who goes short, and tell them",
    text: "Every load is checked against the date its base needs it. Late loads turn red months before launch, and Claude drafts the note to the commander and every shipper affected.",
    points: ["Measured in days a base goes without", "Updates use the planner's numbers only"],
    image: "brief",
    alt: "An update for the base commander and the companies whose cargo moved",
  },
];

const DIFFERENT = [
  { icon: TimerIcon, title: "Measured in days without", text: "A manifest is judged by how long a base goes short, not by kilograms carried or money earned." },
  { icon: ShieldCheckIcon, title: "Money can't outrank survival", text: "Bids only order commercial cargo. Air, water, food and medicine always fly first." },
  { icon: FingerprintIcon, title: "Two planets, one plan", text: "Earth and a base compute the same manifest on their own and confirm it with an 8-character fingerprint." },
  { icon: RadioTowerIcon, title: "Built for delay", text: "One message in, every missing question out at once. The planner keeps working when the link is down." },
];

function Screenshot({ src, alt, priority = false }: { src: string; alt: string; priority?: boolean }) {
  return (
    <div className="relative">
      <div aria-hidden className="glow-center absolute -inset-3 -z-10 rounded-[2rem] sm:-inset-6" />
      <ThemedScreenshot
        name={src}
        alt={alt}
        priority={priority}
        className="rounded-xl border border-border/80 shadow-[0_24px_60px_-24px_rgb(15_23_42/0.28)] dark:shadow-[0_30px_80px_-20px_rgb(0_0_0/0.6)]"
      />
    </div>
  );
}

function SectionHeading({ id, kicker, title, text }: { id?: string; kicker: string; title: string; text?: string }) {
  return (
    <div id={id} className="grid max-w-2xl scroll-mt-24 gap-3">
      <p className="text-sm font-medium text-primary">{kicker}</p>
      <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      {text && <p className="text-lg text-muted-foreground">{text}</p>}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="grid gap-28">
      <section className="grid items-center gap-12 pt-6 lg:grid-cols-[1fr_1.15fr] lg:pt-12">
        <div className="grid justify-items-start gap-7">
          <span className="flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-xs text-muted-foreground">
            <BrandLogo size={22} /> IEEE Lumen 2.0 · Beyond 2030
          </span>
          <h1 className="font-heading text-5xl leading-[1.02] font-semibold tracking-tight text-balance sm:text-6xl">
            Plan what flies to the <span className="text-primary">Moon</span> and <span className="text-mars">Mars</span>.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Miss the ship to Mars and the next one leaves in 26 months. Cargo Window decides what goes on every rocket, survival first, and shows who goes
            short before launch, not after the ship lands without it.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/console/" className={cn(buttonVariants({ size: "lg" }), "h-11 px-5 text-base")}>
              Open the console <ArrowRightIcon />
            </Link>
            <Link href="#how-it-works" className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "h-11 px-4 text-base")}>
              See how it works
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">No sign-up. The console opens on an example day: 2 May 2035.</p>
        </div>
        <Screenshot src="console" alt="The Cargo Window console: the status line, one card per base, and the inbox" priority />
      </section>

      <section aria-label="Key numbers" className="grid grid-cols-2 divide-border/70 rounded-xl border border-border/70 bg-card/40 lg:grid-cols-4 lg:divide-x">
        {STATS.map(([value, label]) => (
          <div key={label} className="grid gap-1 p-6">
            <p className="font-heading text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionHeading
          kicker="The problem"
          title="One rocket. More cargo than room."
          text="On Earth a missed truck costs a day. Off Earth it can leave a crew without a spare part for two years, and today nobody sees it coming."
        />
        <ul className="grid gap-0">
          {PROBLEM.map(({ icon: Icon, title, text }) => (
            <li key={title} className="grid grid-cols-[2.5rem_1fr] gap-x-4 border-t border-border/70 py-6 first:border-t-0 first:pt-0">
              <span className="flex size-10 items-center justify-center rounded-lg border bg-card">
                <Icon className="size-5 text-primary" />
              </span>
              <div className="grid gap-1">
                <h3 className="font-semibold">{title}</h3>
                <p className="text-muted-foreground">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-16">
        <SectionHeading
          id="how-it-works"
          kicker="How it works"
          title="AI reads and writes. Rules decide. People approve."
          text="Three steps, the same ones you'll find in the console."
        />
        {STEPS.map(({ icon: Icon, step, title, text, points, image, alt }, i) => (
          <div key={title} className="grid items-center gap-10 lg:grid-cols-2">
            <div className={cn("grid content-center gap-4", i % 2 === 1 && "lg:order-2")}>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="size-4 text-primary" /> {step}
              </p>
              <h3 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h3>
              <p className="text-lg text-muted-foreground">{text}</p>
              <ul className="grid gap-2">
                {points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <Screenshot src={image} alt={alt} />
          </div>
        ))}
      </section>

      <section className="grid gap-8">
        <SectionHeading
          id="why-mars"
          kicker="Why Mars changes everything"
          title="To the Moon a bumped load waits four weeks. To Mars, two years."
          text="The real launch calendar of the example scenario. Click any launch to open its manifest in the console."
        />
        <HeroTimeline />
      </section>

      <section className="grid gap-10">
        <SectionHeading id="different" kicker="What's different" title="A cargo plan you can trust from two planets away" />
        <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {DIFFERENT.map(({ icon: Icon, title, text }) => (
            <div key={title} className="grid grid-cols-[2.5rem_1fr] gap-x-4">
              <span className="flex size-10 items-center justify-center rounded-lg border bg-card">
                <Icon className="size-5 text-primary" />
              </span>
              <div className="grid gap-1">
                <h3 className="font-semibold">{title}</h3>
                <p className="text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-2xl border border-primary/40 bg-card/60 px-6 py-14 text-center sm:px-12">
        <div aria-hidden className="glow-top absolute inset-0 -z-10" />
        <div className="mx-auto grid max-w-2xl justify-items-center gap-5">
          <BrandLogo size={88} />
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Run the cargo desk on 2 May 2035</h2>
          <p className="text-lg text-muted-foreground">
            A Moon base, a Mars outpost and two crowded rockets. Turn an urgent request from Mars into a booking, add it to the plan, and see who has to wait and what it costs them.
          </p>
          <Link href="/console/" className={cn(buttonVariants({ size: "lg" }), "h-11 px-5 text-base")}>
            Open the console <ArrowRightIcon />
          </Link>
        </div>
      </section>
    </div>
  );
}
