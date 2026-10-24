// The pitch deck as data. The on-screen deck and the PowerPoint download both render these slides,
// so the two never drift apart.

export interface DeckPoint {
  title: string;
  text?: string;
  tag?: "AI" | "RULES";
}

interface Base {
  label: string;
  time: string;
  /** What the presenter says; becomes the speaker notes in PowerPoint. */
  say: string;
}

export type DeckSlide = Base &
  (
    | { kind: "title"; kicker: string; title: string; subtitle: string }
    | { kind: "points"; kicker: string; title: string; accent?: string; points: DeckPoint[] }
    | { kind: "split"; kicker: string; title: string; text?: string; points?: DeckPoint[]; image: string; imageAlt: string; link?: { href: string; label: string } }
    | { kind: "shots"; kicker: string; shots: { image: string; alt: string; caption: string }[] }
    | { kind: "close"; title: string; accent: string; subtitle: string; footnote: string }
  );

export const DECK: DeckSlide[] = [
  {
    kind: "title",
    label: "Title",
    time: "0:00",
    say: "Introduce the team in one sentence, then go straight to the story.",
    kicker: "IEEE Lumen 2.0 · Beyond 2030",
    title: "Cargo Window",
    subtitle: "Deciding what flies to the first bases on the Moon and Mars.",
  },
  {
    kind: "points",
    label: "2035",
    time: "0:00–0:30",
    say: "It's 2035. People live at the Moon's south pole, and six of them live in Jezero crater on Mars. Everything they can't make comes up on a rocket.",
    kicker: "The future",
    title: "It's 2035. Everything the bases can't make comes up on a rocket.",
    points: [
      { title: "Moon base", text: "A flight every four weeks." },
      { title: "Mars outpost", text: "Six people in Jezero crater." },
      { title: "Already starting", text: "NASA has bought commercial Moon cargo since 2018." },
    ],
  },
  {
    kind: "points",
    label: "Problem",
    time: "0:30–1:10",
    say: "Every rocket has fixed room and more cargo than space. On Earth a parcel that misses the truck goes tomorrow. To Mars, the next ship leaves in 26 months. Whoever writes the manifest decides who goes without.",
    kicker: "The problem",
    title: "Miss the ship to Mars and you wait 26 months.",
    accent: "26 months",
    points: [
      { title: "Fixed room", text: "More cargo is waiting than fits." },
      { title: "Rare windows", text: "Mars launches every 26 months." },
      { title: "Slow link", text: "44 minutes for a question and its answer." },
    ],
  },
  {
    kind: "split",
    label: "Solution",
    time: "1:10–1:35",
    say: "Cargo Window plans those flights. It measures every manifest in the days a base goes without, so a bid can never outrank someone's air.",
    kicker: "Cargo Window",
    title: "Survival first. Fair rules for the rest.",
    points: [
      { tag: "AI", title: "1 · Read the request" },
      { tag: "RULES", title: "2 · Approve and pack" },
      { tag: "RULES", title: "3 · See who goes short" },
    ],
    image: "console.jpg",
    imageAlt: "The Cargo Window console with counters and the launch timeline",
  },
  {
    kind: "split",
    label: "Demo",
    time: "1:35–4:10",
    say: "Switch to the console. Read the Sabatier request, approve it, show the rover fleet going red, then the two scenarios, then Write brief, then LN-14 on the Moon. The Pitch & demo page has the full click path.",
    kicker: "Live demo",
    title: "An urgent request from Mars",
    text: "The oxygen reactor is failing. Claude drafts the booking. We approve it. Watch who gets bumped.",
    link: { href: "/console/", label: "Open the console" },
    image: "request-draft.jpg",
    imageAlt: "A booking draft read from the Sabatier reactor request",
  },
  {
    kind: "shots",
    label: "Result",
    time: "during the demo",
    say: "If the live demo fails, use this slide: the reactor flies, the rover fleet is bumped 19 months, and when the crew grows the base goes 650 days short.",
    kicker: "What the demo shows",
    shots: [
      { image: "bumped.jpg", alt: "The rover fleet bumped to the next Mars window, 19 months late", caption: "Oxygen flies. The rover fleet waits 19 months." },
      { image: "consequences.jpg", alt: "Days a base goes short at 650, with late loads in red", caption: "The crew grows. The base now goes 650 days short." },
    ],
  },
  {
    kind: "points",
    label: "Build",
    time: "4:10–4:35",
    say: "The planner is fixed rules, so Earth and Mars each compute the same manifest and confirm it with one short code, even with a 44-minute delay. Claude only reads requests and drafts messages. A person approves every booking.",
    kicker: "How it's built",
    title: "AI reads and writes. Rules decide. People approve.",
    points: [
      { tag: "RULES", title: "Two copies, one plan", text: "Earth and the base get the same 8-character fingerprint." },
      { tag: "AI", title: "Claude, kept honest", text: "Every field checked. Missing numbers block the booking." },
      { title: "Simple stack", text: "Next.js, FastAPI, Claude API, one container." },
    ],
  },
  {
    kind: "close",
    label: "Close",
    time: "4:35–5:00",
    say: "Off Earth, a cargo manifest is part of life support. Cargo Window makes it fair, visible and fast to change. Thank you, we're happy to take questions.",
    title: "Off Earth, a cargo manifest is part of life support.",
    accent: "life support",
    subtitle: "Cargo Window makes it fair, visible and fast to change.",
    footnote: "Thank you · questions welcome",
  },
];

/** Splits a title around its highlighted phrase. */
export function splitAccent(title: string, accent?: string): [string, string, string] {
  const at = accent ? title.indexOf(accent) : -1;
  if (!accent || at < 0) return [title, "", ""];
  return [title.slice(0, at), accent, title.slice(at + accent.length)];
}
