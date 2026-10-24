"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { LaunchTimeline } from "@/components/console/launch-timeline";
import { pack } from "@/lib/engine";
import { seedBookings } from "@/lib/scenario";

/** The console's real timeline on the example scenario; clicking a launch opens the console. */
export function HeroTimeline() {
  const router = useRouter();
  const bookings = useMemo(() => seedBookings(), []);
  const plan = useMemo(() => pack(bookings), [bookings]);
  return <LaunchTimeline bookings={bookings} plan={plan} selected="MS-07" onSelect={() => router.push("/console/")} />;
}
