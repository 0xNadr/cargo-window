import { CapacityBar } from "@/components/console/priority-chip";
import { BASES, arrival, flightsFor, type BaseId, type Booking, type Plan } from "@/lib/engine";
import { fmtDay, gapText, num } from "@/lib/format";
import { summarizeBase } from "@/lib/impact";
import { cn } from "@/lib/utils";

const CREW: Record<BaseId, string> = { moon: "12 crew at the lunar south pole", mars: "6 crew in Jezero crater" };

function statusText(s: ReturnType<typeof summarizeBase>): [string, string] {
  if (s.tone === "bad") return [`Short of supplies for ${num(s.daysShort)} days`, "bg-late/10 text-late"];
  if (s.tone === "warn") return [`${s.late.length} paid ${s.late.length === 1 ? "load" : "loads"} late`, "bg-warn/10 text-warn"];
  return ["Everything arrives on time", "bg-ok/10 text-ok"];
}

export function BaseCards({ bookings, plan, selectedBase, onSelect }: { bookings: Booking[]; plan: Plan; selectedBase: BaseId; onSelect: (base: BaseId) => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {(["mars", "moon"] as BaseId[]).map((base) => {
        const [next, after] = flightsFor(base);
        const m = plan.manifests.get(next.id)!;
        const summary = summarizeBase(base, bookings, plan);
        const [label, tone] = statusText(summary);
        const selected = base === selectedBase;
        return (
          <button
            key={base}
            type="button"
            onClick={() => onSelect(base)}
            aria-pressed={selected}
            className={cn(
              "grid gap-4 rounded-xl border bg-card p-5 text-left transition-colors outline-none hover:border-ring/50 focus-visible:ring-3 focus-visible:ring-ring/40",
              selected && "border-primary/70 ring-1 ring-primary/30",
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold">
                  {BASES[base].name} <span className="font-normal text-muted-foreground">· {BASES[base].body}</span>
                </p>
                <p className="text-sm text-muted-foreground">{CREW[base]}</p>
              </div>
              <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", tone)}>{label}</span>
            </div>
            <div className="grid gap-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                <span>
                  Next rocket <span className="font-medium">{next.id}</span> leaves {fmtDay(next.launch)}
                </span>
                <span className="text-muted-foreground">
                  {num(m.mass)} of {num(next.massCap)} kg loaded
                </span>
              </div>
              <CapacityBar parts={m.loaded.map((b) => ({ priority: b.priority, amount: b.mass }))} cap={next.massCap} className="h-2" />
              <p className="text-sm text-muted-foreground">
                Lands {fmtDay(arrival(next))}.{" "}
                {after && (
                  <>
                    Miss it and the next rocket leaves <span className={cn(after.launch - next.launch > 60 * 864e5 && "font-medium text-foreground")}>{gapText(after.launch - next.launch)} later</span>.
                  </>
                )}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
