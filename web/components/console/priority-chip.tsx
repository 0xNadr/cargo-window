import { PRIORITY, type Priority, type StatusKind } from "@/lib/engine";
import { cn } from "@/lib/utils";

export const SEGMENT: Record<Priority, string> = { life: "bg-life", mission: "bg-mission", commercial: "bg-commercial" };
export const STATUS_TEXT: Record<StatusKind, string> = { ok: "text-ok", moved: "text-moved", late: "text-late" };

/** The class of a load; `compact` shows only the code (P1–P3), with the full label for screen readers and on hover. */
export function PriorityChip({ priority, compact = false, className }: { priority: Priority; compact?: boolean; className?: string }) {
  const { code, label } = PRIORITY[priority];
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-mono text-xs whitespace-nowrap", className)} title={compact ? label : undefined}>
      <span className={cn("size-2.5 rounded-sm", SEGMENT[priority])} />
      {code}
      {compact ? <span className="sr-only"> {label}</span> : ` ${label}`}
    </span>
  );
}

/** A bar split by priority class, sized against a flight's capacity. */
export function CapacityBar({ parts, cap, className }: { parts: { priority: Priority; amount: number }[]; cap: number; className?: string }) {
  return (
    <div className={cn("flex overflow-hidden rounded-sm bg-muted", className)}>
      {(Object.keys(PRIORITY) as Priority[]).map((p) => {
        const sum = parts.filter((x) => x.priority === p).reduce((a, x) => a + x.amount, 0);
        return sum ? <span key={p} className={SEGMENT[p]} style={{ width: `${((sum / cap) * 100).toFixed(2)}%` }} /> : null;
      })}
    </div>
  );
}
