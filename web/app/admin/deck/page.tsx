import type { Metadata } from "next";
import { PitchDeck } from "@/components/pitch-deck";

export const metadata: Metadata = { title: "Pitch deck · Cargo Window" };

export default function DeckPage() {
  return <PitchDeck />;
}
