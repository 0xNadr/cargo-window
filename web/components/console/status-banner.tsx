import { CircleAlertIcon, CircleCheckIcon, TriangleAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Headline } from "@/lib/impact";
import { cn } from "@/lib/utils";

const TONE = {
  good: { box: "border-ok/30 bg-ok/5", icon: CircleCheckIcon, iconTone: "text-ok" },
  warn: { box: "border-warn/40 bg-warn/5", icon: TriangleAlertIcon, iconTone: "text-warn" },
  bad: { box: "border-late/40 bg-late/5", icon: CircleAlertIcon, iconTone: "text-late" },
};

export function StatusBanner({ headline, unread, onShow, onInbox }: { headline: Headline; unread: number; onShow: () => void; onInbox: () => void }) {
  const t = TONE[headline.tone];
  const Icon = t.icon;
  return (
    <section aria-live="polite" className={cn("flex flex-col gap-4 rounded-xl border p-5 sm:flex-row sm:items-center", t.box)}>
      <Icon className={cn("size-7 shrink-0", t.iconTone)} aria-hidden />
      <div className="grid flex-1 gap-1">
        <p className="text-lg leading-snug font-semibold">{headline.title}</p>
        <p className="text-muted-foreground">{headline.detail}</p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        {headline.focus && (
          <Button variant="outline" onClick={onShow}>
            Show me
          </Button>
        )}
        {unread > 0 && (
          <Button onClick={onInbox}>
            Open inbox · {unread} new
          </Button>
        )}
      </div>
    </section>
  );
}
