import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { daysShort, statusOf, type Booking, type Plan } from "@/lib/engine";
import { num } from "@/lib/format";
import { cn } from "@/lib/utils";

export function SummaryStats({ bookings, plan }: { bookings: Booking[]; plan: Plan }) {
  const counts = { ok: 0, moved: 0, late: 0 };
  for (const b of bookings) counts[statusOf(b, plan).kind]++;
  const short = daysShort(bookings, plan);

  const stats = [
    { label: "Loads booked", value: bookings.length, tone: "", help: "Every load waiting for a flight to the Moon or Mars." },
    { label: "On their first flight", value: counts.ok, tone: "text-ok", help: "Loads that fit on the earliest flight to their base." },
    { label: "Moved, still on time", value: counts.moved, tone: "text-moved", help: "Bumped to a later flight, but they still arrive before the base needs them." },
    { label: "Late", value: counts.late, tone: counts.late ? "text-late" : "", help: "Loads that now arrive after the date their base needs them." },
    {
      label: "Days a base goes short",
      value: short,
      tone: short ? "text-late" : "text-ok",
      help: "How many days late the life- and mission-critical loads are, added up. The number a commander cares about most.",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((s) => (
        <Tooltip key={s.label}>
          <TooltipTrigger render={<Card size="sm" className={cn("gap-1 px-4 py-3 text-left", s.label.startsWith("Days") && short > 0 && "border-late/60")} />}>
            <span className={cn("font-heading text-4xl leading-none font-extrabold tabular-nums", s.tone)}>{num(s.value)}</span>
            <span className="text-sm text-muted-foreground">{s.label}</span>
          </TooltipTrigger>
          <TooltipContent className="max-w-64">{s.help}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
