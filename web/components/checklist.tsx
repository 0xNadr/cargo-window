"use client";

import { useLocalStorage } from "@/lib/use-local-storage";
import { cn } from "@/lib/utils";

const KEY = "cargo-window-checks";

export interface CheckItem {
  id: string;
  text: string;
  detail?: string;
  time?: string;
}

function parse(raw: string | null): Set<string> {
  try {
    return new Set(JSON.parse(raw || "[]") as string[]);
  } catch {
    return new Set();
  }
}

/** A rehearsal checklist. Ticks are a per-browser convenience and survive a reload. */
export function Checklist({ items }: { items: CheckItem[] }) {
  const [raw, setRaw] = useLocalStorage(KEY);
  const ticked = parse(raw);

  function toggle(id: string) {
    const next = parse(raw);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setRaw(JSON.stringify([...next]));
  }

  return (
    <ol className="grid gap-2">
      {items.map((item, i) => (
        <li key={item.id}>
          <label className={cn("grid cursor-pointer grid-cols-[auto_1fr_auto] items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:border-ring/60", ticked.has(item.id) && "opacity-60")}>
            <input type="checkbox" checked={ticked.has(item.id)} onChange={() => toggle(item.id)} className="mt-1 size-4 accent-primary" />
            <span>
              <span className="mr-1 font-mono text-xs text-muted-foreground">{i + 1}.</span>
              {item.text}
              {item.detail && <span className="block text-sm text-muted-foreground">{item.detail}</span>}
            </span>
            {item.time && <span className="font-mono text-xs text-muted-foreground">{item.time}</span>}
          </label>
        </li>
      ))}
    </ol>
  );
}
