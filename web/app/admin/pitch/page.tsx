import type { Metadata } from "next";
import { Checklist, type CheckItem } from "@/components/checklist";
import { Bullets, Callout, DocSection } from "@/components/doc";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Pitch & demo · Cargo Window" };

const RUN_SHEET = [
  ["0:00–0:30", "\"It's 2035. People live at the Moon's south pole, and six of them live in Jezero crater on Mars. Everything they can't make comes up on a rocket.\"", "Deck slides 1 and 2"],
  ["0:30–1:10", "\"Every rocket has fixed room and more cargo than space. On Earth a parcel that misses the truck goes tomorrow. To Mars, the next ship leaves in 26 months. Whoever writes the manifest decides who goes without.\"", "Deck slide 3"],
  ["1:10–1:35", "\"Cargo Window plans those flights. It measures every manifest in the days a base goes without, so a bid can never outrank someone's air.\"", "Deck slide 4"],
  ["1:35–4:10", "Live demo, the click path below.", "Console. If it fails, deck slides 5 and 6 tell the same story"],
  ["4:10–4:35", "\"The planner is fixed rules, so Earth and Mars each compute the same manifest and confirm it with one short code, even with a 44-minute delay. Claude only reads requests and drafts messages. A person approves every booking.\"", "Deck slide 7"],
  ["4:35–5:00", "\"Off Earth, a cargo manifest is part of life support. Cargo Window makes it fair, visible and fast to change.\"", "Deck slide 8"],
];

const CLICK_PATH: CheckItem[] = [
  { id: "d1", time: "20 s", text: "From the landing page, click Open the console.", detail: "Point at the three-step strip, the Mars gap on the timeline, and \"Days a base goes short\" at 0." },
  { id: "d2", time: "15 s", text: "MS-07 is open on the right.", detail: "Everything fits. The fingerprint line says the Earth server and the browser agree." },
  { id: "d3", time: "30 s", text: "In the request desk, pick \"Ares: Sabatier reactor failing\" and click Read request.", detail: "Claude drafts it as life-critical, with a need date worked out from the 294 days of oxygen reserve." },
  { id: "d4", time: "20 s", text: "Click Approve and book.", detail: "The toast says one other load is now late: the rover fleet moves to MS-08, 19 months late." },
  { id: "d5", time: "20 s", text: "Pick \"Kepler Mining: drill\" and click Read request.", detail: "Mass and volume are missing, so booking stays blocked. Both questions go back in one message." },
  { id: "d6", time: "10 s", text: "Try a scenario 1: Greenhouse expansion approved.", detail: "Every commercial load is bumped, but days a base goes short stays 0: money gave way, survival didn't." },
  { id: "d7", time: "10 s", text: "Try a scenario 2: Crew grows from 6 to 8.", detail: "The greenhouse LED panels turn red and days a base goes short jumps to 650." },
  { id: "d8", time: "20 s", text: "Click Write brief on the MS-07 manifest.", detail: "Claude drafts the note to the commander and a message to each bumped shipper." },
  { id: "d9", time: "10 s", text: "Flight board › Moon › LN-14.", detail: "On the Moon, bumped loads move four weeks and still arrive on time. That contrast is the point." },
];

const STAGE: CheckItem[] = [
  { id: "s1", text: "Open the deployed app on the presenting laptop.", detail: "Zoom until the request desk and the manifest sit side by side." },
  { id: "s2", text: "Check the status pill at the top says \"Claude online\".", detail: "If it says \"Server, no AI key\", set ANTHROPIC_API_KEY on the server and restart it." },
  { id: "s3", text: "Run the whole click path once shortly before going on.", detail: "It warms the server up and shows Claude's response time on the venue network." },
  { id: "s4", text: "Press Reset scenario right before you start." },
  { id: "s5", text: "Decide who talks and who clicks." },
];

const QA = [
  ["What did you create that wasn't already there?", "Days a base goes short as the measure of a manifest; a class order where bids only sort the commercial tier; a deterministic planner with a fingerprint so two planets can agree without negotiating; and a request desk built for delay that asks every missing question at once."],
  ["Why not let the AI decide what flies?", "Decisions about air and food must be predictable and explainable. The planner gives the same manifest for the same inputs and shows each step. That also lets Earth and the base run it separately and still agree, which an AI decision can't promise."],
  ["What if Claude reads a request wrong?", "It only makes a draft. The server checks every field: an unknown base, a missing number or a date in the past becomes missing and blocks the booking. A cargo officer approves every booking. If Claude isn't available, the offline reader does the same job with simpler rules."],
  ["How does the fingerprint work?", "It is an FNV-1a hash of the flight and its loads in packing order, shown as 8 characters. In the demo the Python server is Earth and the browser is the base; the manifest shows when the two agree. Our tests run both packers on the same bookings and compare every fingerprint."],
  ["Why greedy packing instead of an optimal solver?", "Exact packing is a knapsack problem: it gets expensive as loads grow and its choices are hard to explain. Greedy by class runs instantly and every decision has one reason. An exact solver could later run as a second opinion."],
  ["Can a rich company buy its way to the top?", "No. The class comes from what the load does and is set by base policy. Bids only order loads inside the commercial class."],
  ["What if the life-critical loads alone don't fit?", "They move to the next flight like any load and turn red straight away, with how many days the base goes short. Software can't add room to a rocket. It makes sure a person sees the problem months ahead."],
  ["Where do the 26 months come from?", "Earth and Mars line up for a low-energy transfer about every 780 days. Launching outside that window needs far more fuel, so cargo flights cluster in the windows."],
  ["What is the stack?", "A FastAPI server in Python with Pydantic models holds the planner and calls Claude through the Anthropic SDK; the key never leaves the server. The console is Next.js with Tailwind and shadcn/ui, exported as static files the same server hosts. One Docker container deploys both."],
  ["Who pays for it?", "Flight operators license it to plan and sell capacity, base agencies use the desk and board, and there is a small fee on each commercial booking."],
  ["What are the limits?", "Mass and volume only: no centre of gravity, hazardous goods, partial loads or return cargo. Prices, companies and capacities are invented. Launch timing follows the real cycle."],
];

export default function PitchPage() {
  return (
    <div className="grid gap-14">
      <section className="grid gap-4">
        <p className="label-caps text-xs text-muted-foreground">Pitch session · 25 October, 09:00</p>
        <p className="max-w-[26ch] font-heading text-4xl leading-none font-semibold sm:text-5xl tracking-tight">
          Cargo Window decides what flies to off-world bases: survival first, fair rules for the rest, every cost visible before launch.
        </p>
        <p className="font-mono text-sm text-muted-foreground">
          <span className="text-foreground">5 min</span> pitch including the demo · <span className="text-foreground">5 min</span> jury questions
        </p>
      </section>

      <DocSection eyebrow="Have it ready" title={"“What did you create that wasn't already there?”"}>
        <Callout>
          &ldquo;Cargo tools today rank loads by price and assume a live link. We built a planner that measures a manifest in days a base goes without, so a bid can never outrank someone&apos;s air. Its rules are deterministic, so Earth and Mars can each compute the manifest and confirm it with one 8-character code across a 44-minute delay. And its request desk turns one message from a crew into a booking and asks every missing question at once.&rdquo;
        </Callout>
        <p className="text-sm text-muted-foreground">About 25 seconds out loud. The originality table on the idea page backs up each claim.</p>
      </DocSection>

      <DocSection eyebrow="Five minutes" title="Run sheet">
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>What you say</TableHead>
                <TableHead>On screen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RUN_SHEET.map(([time, say, screen]) => (
                <TableRow key={time}>
                  <TableCell className="align-top font-mono text-primary">{time}</TableCell>
                  <TableCell className="max-w-[52ch] align-top whitespace-normal italic">{say}</TableCell>
                  <TableCell className="align-top whitespace-normal text-muted-foreground">{screen}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </DocSection>

      <DocSection eyebrow="About 2 min 35 s" title="Demo click path">
        <p className="text-sm text-muted-foreground">Tick steps off while you rehearse. Ticks are kept in this browser only.</p>
        <Checklist items={CLICK_PATH} />
      </DocSection>

      <DocSection eyebrow="100 points" title="How this pitch scores">
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Criterion</TableHead>
                <TableHead className="text-right">Points</TableHead>
                <TableHead>What earns it</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                ["SaaS / solution quality", "30", "It works end to end on stage: request, draft, approval, manifest, consequences, brief. It keeps working without Claude or without the server."],
                ["Innovation & creativity", "25", "Days a base goes short as the measure of a manifest, a class order money can't climb, and a planner two planets agree on without talking."],
                ["Future relevance", "20", "Starts from lunar cargo deliveries that already happen and rests on the real Mars launch cycle, signal delay and solar conjunction."],
                ["Technical understanding & defense", "15", "A packer small enough to walk through line by line, a clear reason for every technology, clear limits on the AI, and tests that prove both copies agree."],
                ["Problem significance", "10", "A wrong manifest can leave a crew short for two years. Few people, enormous stakes."],
              ].map(([c, p, w]) => (
                <TableRow key={c}>
                  <TableCell className="align-top font-semibold whitespace-normal">{c}</TableCell>
                  <TableCell className="text-right align-top font-mono text-primary">{p}</TableCell>
                  <TableCell className="align-top whitespace-normal text-muted-foreground">{w}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </DocSection>

      <DocSection eyebrow="Five minutes of questions" title="What the jury will ask">
        <Card className="px-4 py-1">
          <Accordion>
            {QA.map(([q, a]) => (
              <AccordionItem key={q} value={q}>
                <AccordionTrigger className="text-base">{q}</AccordionTrigger>
                <AccordionContent className="max-w-[72ch] text-muted-foreground">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </DocSection>

      <DocSection eyebrow="Before you go on" title="Stage checklist">
        <Checklist items={STAGE} />
      </DocSection>

      <DocSection eyebrow="Plan B" title="If something breaks">
        <Bullets
          items={[
            <><strong>Claude is busy or the key is missing:</strong> the offline reader and the brief template take over by themselves. Say it out loud: &ldquo;This is the mode a base uses during a blackout.&rdquo;</>,
            <><strong>A wrong click:</strong> press Reset scenario and jump back in with the scenarios.</>,
            <><strong>The server is unreachable:</strong> the browser carries its own copy of the planner, so everything except Claude keeps working. The status pill switches to &ldquo;Offline: base copy&rdquo;.</>,
          ]}
        />
      </DocSection>

      <DocSection eyebrow="Rules 12.4 and 12.5" title="What to disclose">
        <Bullets
          items={[
            <><strong>AI in the product:</strong> Claude reads requests and drafts briefs, called from our FastAPI server with the Anthropic Python SDK. It never decides what flies.</>,
            <><strong>AI used to build it:</strong> Claude Code, Anthropic&apos;s coding assistant (model Claude Opus 5.5), wrote most of the code, documentation and screenshots under the team&apos;s direction. Every member should be able to explain the packer, the need-date check, the fingerprint and the limits on the AI.</>,
            <><strong>External resources:</strong> FastAPI, Pydantic, Uvicorn and the Anthropic Python SDK on the server; Next.js, Tailwind CSS and shadcn/ui in the console; Google Fonts and the public FNV-1a hash algorithm.</>,
          ]}
        />
      </DocSection>
    </div>
  );
}
