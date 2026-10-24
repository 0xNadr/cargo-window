import type { Metadata } from "next";
import { Bullets, Callout, DocSection, Kind, Prose } from "@/components/doc";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "The idea · Cargo Window" };

const FACTS = [
  ["26", "months", "Between low-energy launch windows from Earth to Mars. Miss one and the next ship is two years away."],
  ["~7", "months", "Trip time to Mars on a typical transfer. What is on board was decided long before it is needed."],
  ["3–22", "min", "One-way signal delay between Earth and Mars. A question and its answer can take 44 minutes."],
  ["~2", "weeks", "Contact with Mars drops every 26 months, when the Sun sits between the planets."],
];

const TIMELINE: [string, boolean, string][] = [
  ["2018", true, "NASA starts buying cargo deliveries to the Moon from private companies."],
  ["2020s", true, "Artemis aims for a lasting human presence near the lunar south pole. Reusable heavy rockets push the cost per kilogram down."],
  ["Early 2030s", false, "A permanent lunar base with flights every few weeks. Mining, research, media and tourism companies buy space next to agencies."],
  ["2035", false, "A first small crewed outpost on Mars, fully dependent on cargo from Earth and reachable only in windows about 26 months apart."],
  ["Then", false, "Every flight is oversubscribed, and the manifest becomes the most contested decision in the program."],
];

const SOLUTION: [string, "AI" | "RULES", string][] = [
  ["Request desk", "AI", "Crews write what they need in their own words. Claude turns the message into a booking draft, works out the need date from what's left in stock, and puts every missing detail into one reply."],
  ["Packer", "RULES", "Published, fixed rules decide what flies: life-critical first, then mission-critical, then commercial by bid. Money only sorts the commercial tier."],
  ["Consequence board", "RULES", "Every load is checked against the date its base needs it. Each manifest is measured in days a base goes short, with late loads in red, months before launch."],
  ["Manifest fingerprint", "RULES", "An 8-character code computed from each manifest. Earth and the base compare codes in one short message to confirm they hold the same plan."],
  ["Briefs", "AI", "Claude drafts the note to the commander and the message to each bumped shipper, using only the planner's numbers. A person checks it and sends it."],
];

const TECH = [
  ["Rule-based packer, our own code in Python and TypeScript", "Builds every manifest: Python on the Earth server, TypeScript in the browser as the base copy", "Decisions about air and food must be predictable and explainable. Same inputs give the same manifest on both planets, and a test proves the two copies agree."],
  ["Python, FastAPI and Pydantic", "The Earth server: packing, the request desk and briefs behind a typed API", "Typed models reject bad input at the door, and FastAPI documents the API for free."],
  ["Claude, through the Anthropic Python SDK", "Reads free-text requests into booking drafts and drafts briefs, on the server", "Requests are messy and urgent, and each follow-up question costs a 44-minute round trip. One good reading saves hours. The API key stays on the server."],
  ["Next.js, Tailwind CSS and shadcn/ui", "The console and these admin pages", "Accessible, consistent components for a tool people use under pressure. Builds to static files the Python server hosts."],
  ["Manifest fingerprint (FNV-1a hash)", "Turns a manifest into an 8-character code", "Two planets confirm they agree with one tiny message instead of resending the whole manifest."],
  ["Docker and Render", "Ships the server and the console as one service", "One container, one URL, deployed from the repository."],
];

const FLOW: ["AI" | "RULES" | "PEOPLE", string, string][] = [
  ["PEOPLE", "Crew writes a request", "In plain words, under pressure, over a delayed link."],
  ["AI", "Claude drafts the booking", "Load, class, mass, volume, need date. Missing facts become questions."],
  ["PEOPLE", "Cargo officer approves", "Missing numbers block it. Nothing is guessed."],
  ["RULES", "Packer builds manifests", "Flight by flight, in a fixed order, one reason per decision."],
  ["RULES", "Board shows the cost", "Arrival against need date, days a base goes short, fingerprint."],
  ["AI", "Claude drafts the briefs", "The officer edits and sends them to the base and each shipper."],
];

const PSEUDOCODE = `for each base:
  waiting = every booking for that base
  for each flight to that base, in launch order:
    sort waiting by class: life-critical, mission-critical, commercial
      inside life and mission: earliest need date first
      inside commercial: highest bid per kg first
    for each load in that order:
      if it fits the mass and volume left: put it on this flight
      otherwise: it waits for the next flight
for each load:
  arrives    = launch + trip days
  days short = arrives - need date   (late if above zero)`;

function SimpleTable({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <Card className="py-0">
      <Table>
        <TableHeader>
          <TableRow>{head.map((h) => <TableHead key={h}>{h}</TableHead>)}</TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r[0]}>
              {r.map((c, i) => <TableCell key={i} className={i === 0 ? "font-semibold whitespace-normal" : "whitespace-normal text-muted-foreground"}>{c}</TableCell>)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function Split({ items }: { items: [string, React.ReactNode][] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map(([title, body]) => (
        <Card key={title} className="gap-3 p-4">
          <h3 className="label-caps text-sm">{title}</h3>
          {body}
        </Card>
      ))}
    </div>
  );
}

export default function IdeaPage() {
  return (
    <div className="grid gap-14">
      <section className="grid gap-5">
        <p className="label-caps text-xs text-muted-foreground">Beyond 2030 · Our idea</p>
        <h1 className="max-w-[15ch] font-heading text-5xl leading-[1.02] font-semibold sm:text-7xl tracking-tight">
          Miss the ship to Mars and you wait <span className="text-primary">26&nbsp;months</span>.
        </h1>
        <p className="max-w-[64ch] text-lg text-muted-foreground">
          Cargo Window plans what flies to the first bases on the Moon and Mars. It measures every manifest in{" "}
          <strong className="text-foreground">the days a base goes without</strong>, never lets a bid outrank survival, and works across a 44-minute signal delay.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FACTS.map(([n, unit, text]) => (
            <Card key={n} className="gap-2 p-4">
              <p className="font-heading text-5xl leading-none font-semibold tabular-nums tracking-tight">
                {n}
                <small className="ml-1 text-2xl text-muted-foreground">{unit}</small>
              </p>
              <p className="text-sm text-muted-foreground">{text}</p>
            </Card>
          ))}
        </div>
      </section>

      <DocSection eyebrow="1 · The problem" title="Deciding what flies when the next ship is two years away">
        <Prose>
          <p>
            Every rocket to an off-world base has a fixed mass and volume, and in 2035 every flight has more cargo waiting than room. <strong>Someone has to choose what goes.</strong> On Earth that choice is cheap to get wrong, because the next truck leaves tomorrow. To Mars, the next ship leaves in about 26 months, so the manifest decides who goes without for two years.
          </p>
          <p>Today manifests for a handful of government missions are built by hand, in spreadsheets and meetings. That stops working once several bases and dozens of companies share each flight. Three things break at once:</p>
        </Prose>
        <Bullets
          items={[
            <><strong>Fairness:</strong> there are no shared, published rules for who gets bumped, so money or politics decides.</>,
            <><strong>Foresight:</strong> nobody sees that a bumped load leaves a base short until the ship lands without it.</>,
            <><strong>Requests:</strong> crews ask over a delayed link, and every clarifying question to Mars costs up to 44 minutes.</>,
          ]}
        />
      </DocSection>

      <DocSection eyebrow="2 · Who it affects" title="Five groups, one rocket">
        <SimpleTable
          head={["Who", "What goes wrong for them today"]}
          rows={[
            ["Base crews", "A spare part they needed lands on the next ship, months after the old one fails."],
            ["Base commanders", "They learn about a shortage when the ship arrives without it, with no time left to plan around it."],
            ["Cargo officers on Earth", "Requests arrive as messy messages over a delayed link, and every follow-up question costs a round trip."],
            ["Flight operators", "They must fill every kilogram and justify every refusal to agencies and paying customers."],
            ["Companies shipping cargo", "They pay for space and find out late that their load was bumped, with no reason given."],
          ]}
        />
      </DocSection>

      <DocSection eyebrow="3 · Why it matters" title="A bumped load can be a health risk for two years">
        <Bullets
          items={[
            <><strong>The stakes are lives, not delays.</strong> A CO₂ scrubber cartridge that misses the Mars window leaves a crew short of air-cleaning spares until the next one.</>,
            <><strong>Every kilogram is expensive.</strong> Delivering cargo to the Moon costs hundreds of thousands of dollars per kilogram today. Wasted room is wasted money.</>,
            <><strong>Sharing needs trust.</strong> Agencies and companies will only share flights if the rules are fair, published and the same for everyone.</>,
            <><strong>Bases can&apos;t fix it alone.</strong> By the time a crew notices a part is missing, the window has closed.</>,
          ]}
        />
      </DocSection>

      <DocSection eyebrow="4 · How it emerges" title="From today's lunar deliveries to full Mars windows">
        <ol className="grid border-l border-input pl-0">
          {TIMELINE.map(([year, fact, text]) => (
            <li key={year} className="relative grid grid-cols-[6rem_1fr] gap-3 py-2.5 pl-5">
              <span className={`absolute top-4 -left-[5px] size-2.5 rounded-full border-[1.5px] bg-background ${fact ? "border-ok" : "border-primary"}`} />
              <span className="font-mono text-sm">{year}</span>
              <p className="text-muted-foreground">
                <span className={`mr-2 rounded-sm border px-1.5 font-mono text-[10.5px] tracking-wider ${fact ? "text-ok" : "text-primary"}`}>{fact ? "FACT" : "ASSUMPTION"}</span>
                {text}
              </p>
            </li>
          ))}
        </ol>
        <Split
          items={[
            ["Why today's tools won't cope", <Bullets key="a" items={[
              <><strong>Freight software optimises cost or revenue.</strong> A missed slot on Earth costs a day.</>,
              <><strong>Airline cargo bumps by fare.</strong> Off Earth, the highest payer must never outrank a CO₂ scrubber.</>,
              <><strong>Planning tools assume a live link</strong> to one central system. Mars is 22 minutes away and sometimes unreachable.</>,
            ]} />],
            ["Why our answer holds up", <Bullets key="b" items={[
              "The 26-month window and the signal delay are physics, not guesses.",
              "The first step, commercial lunar cargo, already exists.",
              "The problem grows with every base and every company that joins.",
            ]} />],
          ]}
        />
      </DocSection>

      <DocSection eyebrow="Precedent" title="It already happens on Earth, on a small scale">
        <Prose>
          <p>The problem isn&apos;t invented. Places that are hard to reach already live by resupply windows, and they plan them by hand.</p>
        </Prose>
        <Bullets
          items={[
            <><strong>Antarctica:</strong> the South Pole station gets no flights for about eight months of winter. What misses the last summer flight waits until spring.</>,
            <><strong>The space station:</strong> cargo flights are packed against priority lists, and when a flight is cut back, lower-priority items stay on the ground.</>,
            <><strong>Remote islands and research ships:</strong> supplies come with scheduled ships, and a missed sailing means weeks or months without.</>,
          ]}
        />
        <Callout>Off-world bases take the same problem and make it bigger, slower to fix and less forgiving. The planning tools haven&apos;t caught up.</Callout>
      </DocSection>

      <DocSection eyebrow="5 · What the solution does" title="Ask, decide, show the cost, agree">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {SOLUTION.map(([title, kind, text]) => (
            <Card key={title} className="gap-2 p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold">{title}</h3>
                <Kind kind={kind} />
              </div>
              <p className="text-sm text-muted-foreground">{text}</p>
            </Card>
          ))}
        </div>
      </DocSection>

      <DocSection eyebrow="6 · Technologies" title="Each one earns its place">
        <SimpleTable head={["Technology", "What it does here", "Why it belongs"]} rows={TECH} />
        <Split
          items={[
            ["Left out on purpose", <Bullets key="c" items={[
              <><strong>Blockchain:</strong> one operator with signed bookings is enough. A chain adds cost and slow agreement between planets.</>,
              <><strong>An optimisation solver or machine learning for packing:</strong> a commander can&apos;t check its answers. Fixed rules can be checked step by step.</>,
              <><strong>A database:</strong> the server is stateless and the browser holds the scenario. Production adds a shared store and signed bookings.</>,
            ]} />],
          ]}
        />
      </DocSection>

      <DocSection eyebrow="7 · Design and build" title="AI reads and writes. Rules decide. People approve.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Never guess a number", "A missing mass or date stays missing and blocks the booking. The server checks every field Claude returns."],
            ["Same inputs, same manifest", "No randomness and no AI in the decision, so Earth and the base can each compute it and agree."],
            ["Measure what people feel", "A manifest is scored by days a base goes short, not by kilograms carried or revenue earned."],
            ["A person signs off", "Claude drafts bookings and messages. Nothing is booked or sent without a cargo officer."],
          ].map(([t, b]) => (
            <Card key={t} className="gap-2 p-4">
              <h3 className="font-semibold">{t}</h3>
              <p className="text-sm text-muted-foreground">{b}</p>
            </Card>
          ))}
        </div>
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {FLOW.map(([kind, title, text], i) => (
            <li key={title} className="grid content-start gap-1.5 rounded-lg border bg-card p-3">
              <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              <Kind kind={kind} />
              <span className="text-sm font-semibold">{title}</span>
              <span className="text-xs text-muted-foreground">{text}</span>
            </li>
          ))}
        </ol>
        <pre className="overflow-x-auto rounded-lg border bg-card p-4 font-mono text-[13px] leading-relaxed" aria-label="Packing algorithm">{PSEUDOCODE}</pre>
      </DocSection>

      <DocSection eyebrow="Originality" title="What we created that wasn't already there">
        <Callout>
          A cargo planner that measures a manifest in the days people go without, where money can never outrank survival, that two planets can run separately and still agree on, and that gathers every missing fact in one message across a 44-minute delay.
        </Callout>
        <SimpleTable
          head={["What exists today", "What we added"]}
          rows={[
            ["Freight and airline cargo tools rank loads by cost or fare.", "A class order where money only sorts the commercial tier. Survival can never be outbid."],
            ["Planners report kilograms used and revenue earned.", "Days a base goes short as the measure of a manifest, checked for every load against the date its base runs out."],
            ["Planning tools assume a live link to one central system.", "A deterministic packer plus a fingerprint, so Earth and a base compute the same manifest on their own and confirm it in one short message."],
            ["Forms and chat assume instant back-and-forth.", "A request desk built for delay: one message becomes a booking draft, every missing question goes back in one reply, and it still works offline."],
          ]}
        />
        <Split
          items={[
            ["Built by us", <Bullets key="d" items={[
              "The packer in Python and TypeScript, the need-date check and the days-short measure.",
              "The manifest fingerprint, and a test that runs both packers on the same bookings and compares them.",
              "The FastAPI server: request desk and briefs, with checks on every field Claude returns.",
              "The console and these pages.",
            ]} />],
            ["Borrowed and credited", <Bullets key="e" items={[
              "Claude, through the Anthropic Python SDK, for reading requests and drafting briefs.",
              "FastAPI, Pydantic, Uvicorn, Next.js, Tailwind CSS and shadcn/ui.",
              "Google Fonts: Schibsted Grotesk, IBM Plex Mono, Big Shoulders Stencil.",
              "PptxGenJS, for the PowerPoint download of the pitch deck.",
              "The FNV-1a hash, a public algorithm.",
            ]} />],
          ]}
        />
      </DocSection>

      <DocSection eyebrow="The 2030+ test" title="Three questions every project must pass">
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ["Why will this problem exist?", "Cheaper reusable launches and permanent bases create more cargo than room, and orbital mechanics limits Mars flights to windows about 26 months apart."],
            ["Why does it matter?", "A wrong manifest can leave a crew without air-cleaning spares, water parts or medicine for up to two years, and nobody finds out until the ship lands."],
            ["Why is our solution the right one?", "It makes the choice fair and predictable, shows the human cost before launch, and keeps working across delay and blackout."],
          ].map(([q, a]) => (
            <Card key={q} className="gap-2 p-4">
              <h3 className="font-semibold">{q}</h3>
              <p className="text-sm text-muted-foreground">{a}</p>
            </Card>
          ))}
        </div>
      </DocSection>

      <DocSection eyebrow="Business and impact" title="Who pays and what changes">
        <Split
          items={[
            ["Who pays", <Bullets key="f" items={[
              <><strong>Flight operators</strong> license it to plan and sell their capacity.</>,
              <><strong>Base agencies</strong> use the request desk and the board for their crews.</>,
              <><strong>A small fee on each commercial booking</strong> made through it.</>,
            ]} />],
            ["What changes", <Bullets key="g" items={[
              "Shortages show up months before launch, while there is still time to act.",
              "Companies get fair, published rules and a reason for every bump.",
              "Every decision is recorded and can be reviewed afterwards.",
            ]} />],
          ]}
        />
      </DocSection>

      <DocSection eyebrow="Next" title="After the hackathon">
        <Bullets
          items={[
            <><strong>Need dates from base data:</strong> forecast when scrubbers, filters and food run out from how fast the base uses them.</>,
            <><strong>A full copy at each base</strong> that syncs signed bookings when the link is up and compares fingerprints.</>,
            <><strong>Return cargo</strong> (samples back to Earth), hazardous goods rules and centre of gravity.</>,
            <><strong>Signed bookings and an audit log</strong>, so nobody can quietly change a priority.</>,
            <><strong>A priority policy the bases and operators sign in advance</strong>, so the classes themselves are agreed before any flight is full.</>,
            <><strong>Voice requests as recorded messages:</strong> crews in suits or mid-repair speak a request, it is transcribed at the base and sent as one message. Live voice agents don&apos;t fit a 44-minute round trip.</>,
          ]}
        />
        <p className="max-w-[90ch] text-xs text-muted-foreground/80">
          Example scenario. Bases, companies, people, prices and capacities are invented. Mars launch timing, trip length, signal delay and solar conjunction follow real orbital mechanics.
        </p>
      </DocSection>
    </div>
  );
}
