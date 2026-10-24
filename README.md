# Cargo Window

Cargo planning for the first bases on the Moon and Mars. Built for the IEEE Lumen 2.0 "Beyond 2030" challenge.

A rocket to an off-world base has fixed room, and in 2035 every flight has more cargo waiting than space. On Earth a parcel that misses the truck goes tomorrow. To Mars, the next ship leaves in about 26 months. Cargo Window decides what flies using fixed, published rules, and shows what each decision costs the people waiting for it before launch.

## Run it

Open `index.html` in a browser. There is nothing to install and no build step.

- **Opened from disk:** everything works. Requests are read by the offline reader and briefs come from the template.
- **Opened as the published Claude artifact:** the request desk and the briefs are written by Claude. The viewer allows it once, on first use.

## What it does

| Part | What it does | Decided by |
|---|---|---|
| Request desk | Turns a crew's free-text message into a booking draft and puts every missing detail into one reply | Claude, approved by a person |
| Packer | Builds each flight's manifest: life-critical first, then mission-critical, then commercial by bid | Fixed rules |
| Consequence board | Checks every load against the date its base needs it, and counts the days a base goes short | Fixed rules |
| Manifest fingerprint | An 8-character code per manifest, so Earth and a base can confirm they hold the same plan | Fixed rules |
| Briefs | Drafts the note to the commander and the message to each bumped shipper | Claude, sent by a person |

## What we created that wasn't already there

- A manifest is measured in **days a base goes short**, not in kilograms carried or revenue earned.
- **Money can't outrank survival:** bids only sort loads inside the commercial class.
- **Two planets can agree without negotiating:** the packer is deterministic, so Earth and Mars compute the same manifest and compare fingerprints in one short message across a delay of up to 44 minutes.
- **A request desk built for delay** that asks every missing question at once and keeps working offline.

## Where the code is

All code is in `index.html`, in the `<script>` block at the end.

| Function | Purpose |
|---|---|
| `pack()`, `packOrder()` | The packing rules |
| `statusOf()`, `consequence()`, `daysShort()` | The need-date check and the days a base goes short |
| `fingerprint()` | The manifest fingerprint (FNV-1a hash) |
| `intakePrompt()`, `normalizeDraft()`, `readOffline()` | The request desk: Claude's prompt, the checks on its answer, and the offline reader |
| `briefPrompt()`, `offlineBrief()` | The briefs |

## AI use (rule 12.5)

- **In the product:** Claude, through the Claude artifact runtime, reads requests and drafts briefs. It never decides what flies. Every field it returns is checked, missing numbers block the booking, and a person approves every booking.
- **To build it:** _list the AI coding assistants the team used here._ The team reviewed the code and can explain every part of it.

## Credits (rule 12.4)

- Fonts from Google Fonts: Barlow, Barlow Condensed, IBM Plex Mono and Big Shoulders Stencil.
- The FNV-1a hash, a public algorithm.
- No other libraries.

## Limits

The packer only checks mass and volume. It does not handle centre of gravity, hazardous goods, partial loads or return cargo. Bases, companies, people, prices and capacities are invented for the example scenario. Mars launch timing, trip length, signal delay and solar conjunction follow real orbital mechanics.
