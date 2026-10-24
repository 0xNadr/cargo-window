import { PRIORITY, type Priority, type StatusKind } from "@/lib/engine";
import { cn } from "@/lib/utils";

export const SEGMENT: Record<Priority, string> = { life: "bg-life", mission: "bg-mission", commercial: "bg-commercial" };
export const STATUS_TEXT: Record<StatusKind, string> = { ok: "text-ok", moved: "text-moved", late: "text-late" };

/** What each class means, in the words a crew member would use. */
export const CLASS_MEANING: Record<Priority, string> = {
  life: "Keeps the crew alive",
  mission: "Keeps the base running",
  commercial: "Paid cargo from companies",
};

export function PriorityChip({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs whitespace-nowrap", className)}>
      <span className={cn("size-2 rounded-full", SEGMENT[priority])} />
      {PRIORITY[priority].label}
    </span>
  );
}

/** A bar split by priority class, sized against a flight's capacity. */
export function CapacityBar({ parts, cap, className }: { parts: { priority: Priority; amount: number }[]; cap: number; className?: string }) {
  return (
    <div className={cn("flex overflow-hidden rounded-full bg-muted", className)}>
      {(Object.keys(PRIORITY) as Priority[]).map((p) => {
        const sum = parts.filter((x) => x.priority === p).reduce((a, x) => a + x.amount, 0);
        return sum ? <span key={p} className={SEGMENT[p]} style={{ width: `${((sum / cap) * 100).toFixed(2)}%` }} /> : null;
      })}
    </div>
  );
}

/** A plain-language status pill: on time, moved but on time, or late. */
export function StatusPill({ kind, children }: { kind: StatusKind; children: React.ReactNode }) {
  const tone = kind === "late" ? "bg-late/10 text-late" : kind === "moved" ? "bg-moved/10 text-moved" : "bg-ok/10 text-ok";
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap", tone)}>{children}</span>;
}
