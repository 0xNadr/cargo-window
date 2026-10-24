import { DECK, splitAccent, type DeckPoint } from "@/lib/deck";

// Widescreen slides are 13.33 × 7.5 inches. Arial keeps the file readable on any machine.
const W = 13.33;
const X = 0.75;
const CONTENT_W = W - 2 * X;
const FONT = "Arial";
const C = { bg: "0B0F1A", card: "151B2B", line: "2A3350", text: "EEF0F6", muted: "9AA1B9", accent: "E6AA4A", rules: "F3EFE4" };
const SHOT_RATIO = 798 / 1512;

type Pptx = InstanceType<typeof import("pptxgenjs").default>;
type Slide = ReturnType<Pptx["addSlide"]>;

const shotUrl = (name: string) => `${window.location.origin}/screenshots/${name}`;

function kicker(slide: Slide, text: string, y = 0.65) {
  slide.addText(text, { x: X, y, w: CONTENT_W, h: 0.4, fontFace: FONT, fontSize: 14, color: C.accent });
}

function title(slide: Slide, text: string, opts: { y: number; h: number; size: number; w?: number; accent?: string }) {
  const [before, accent, after] = splitAccent(text, opts.accent);
  slide.addText(
    [
      { text: before, options: { color: C.text } },
      ...(accent ? [{ text: accent, options: { color: C.accent } }] : []),
      ...(after ? [{ text: after, options: { color: C.text } }] : []),
    ],
    { x: X, y: opts.y, w: opts.w ?? CONTENT_W, h: opts.h, fontFace: FONT, fontSize: opts.size, bold: true, valign: "top" },
  );
}

function card(pptx: Pptx, slide: Slide, p: DeckPoint, x: number, y: number, w: number, h: number) {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h, fill: { color: C.card }, line: { color: C.line, width: 1 }, rectRadius: 0.12 });
  let top = y + 0.2;
  if (p.tag) {
    slide.addText(p.tag, { x: x + 0.25, y: top, w: 1.2, h: 0.3, fontFace: FONT, fontSize: 10, color: p.tag === "AI" ? C.accent : C.rules, bold: true });
    top += 0.35;
  }
  slide.addText(p.title, { x: x + 0.25, y: top, w: w - 0.5, h: 0.5, fontFace: FONT, fontSize: 18, bold: true, color: C.text, valign: "top" });
  if (p.text) slide.addText(p.text, { x: x + 0.25, y: top + 0.5, w: w - 0.5, h: h - (top - y) - 0.6, fontFace: FONT, fontSize: 13, color: C.muted, valign: "top" });
}

function footer(slide: Slide, n: number) {
  slide.addText("Cargo Window", { x: X, y: 6.9, w: 4, h: 0.3, fontFace: FONT, fontSize: 10, bold: true, color: C.muted });
  slide.addText(`${n} / ${DECK.length}`, { x: W - X - 2, y: 6.9, w: 2, h: 0.3, fontFace: FONT, fontSize: 10, color: C.muted, align: "right" });
}

/** Builds the pitch deck as a .pptx in the browser and saves it. */
export async function downloadDeckAsPowerPoint(): Promise<void> {
  const { default: PptxGenJS } = await import("pptxgenjs");
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.title = "Cargo Window: pitch deck";
  pptx.company = "IEEE Lumen 2.0 · Beyond 2030";

  DECK.forEach((s, i) => {
    const slide = pptx.addSlide();
    slide.background = { color: C.bg };
    slide.addNotes(`${s.time}\n\n${s.say}`);

    if (s.kind === "title") {
      kicker(slide, s.kicker, 2.3);
      title(slide, s.title, { y: 2.75, h: 1.4, size: 66 });
      slide.addText(s.subtitle, { x: X, y: 4.25, w: 8.5, h: 0.9, fontFace: FONT, fontSize: 24, color: C.text });
    } else if (s.kind === "points") {
      kicker(slide, s.kicker);
      title(slide, s.title, { y: 1.1, h: 1.9, size: 38, accent: s.accent, w: 10.5 });
      const gap = 0.3;
      const w = (CONTENT_W - gap * (s.points.length - 1)) / s.points.length;
      s.points.forEach((p, j) => card(pptx, slide, p, X + j * (w + gap), 3.6, w, 2.4));
    } else if (s.kind === "split") {
      const leftW = 5.3;
      kicker(slide, s.kicker, 1.0);
      title(slide, s.title, { y: 1.45, h: 1.6, size: 34, w: leftW });
      let y = 3.15;
      if (s.text) {
        slide.addText(s.text, { x: X, y, w: leftW, h: 1.2, fontFace: FONT, fontSize: 16, color: C.muted, valign: "top" });
        y += 1.3;
      }
      s.points?.forEach((p) => {
        card(pptx, slide, p, X, y, leftW, 0.95);
        y += 1.1;
      });
      if (s.link) slide.addText(`${s.link.label} →`, { x: X, y, w: leftW, h: 0.4, fontFace: FONT, fontSize: 14, bold: true, color: C.accent });
      const imgW = CONTENT_W - leftW - 0.5;
      slide.addImage({ path: shotUrl(s.image), x: X + leftW + 0.5, y: 1.6, w: imgW, h: imgW * SHOT_RATIO, altText: s.imageAlt });
    } else if (s.kind === "shots") {
      kicker(slide, s.kicker);
      const gap = 0.4;
      const w = (CONTENT_W - gap) / 2;
      s.shots.forEach((shot, j) => {
        const x = X + j * (w + gap);
        slide.addImage({ path: shotUrl(shot.image), x, y: 1.4, w, h: w * SHOT_RATIO, altText: shot.alt });
        slide.addText(shot.caption, { x, y: 1.55 + w * SHOT_RATIO, w, h: 0.6, fontFace: FONT, fontSize: 16, color: C.text });
      });
    } else {
      title(slide, s.title, { y: 1.9, h: 2.4, size: 50, accent: s.accent, w: 11 });
      slide.addText(s.subtitle, { x: X, y: 4.4, w: 9, h: 0.6, fontFace: FONT, fontSize: 22, color: C.text });
      slide.addText(s.footnote, { x: X, y: 5.2, w: 9, h: 0.4, fontFace: FONT, fontSize: 13, color: C.muted });
    }
    footer(slide, i + 1);
  });

  await pptx.writeFile({ fileName: "Cargo-Window-pitch.pptx" });
}
