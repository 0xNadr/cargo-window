import { CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EVENTS } from "@/lib/scenario";

export function ScenarioCard({ applied, onApply }: { applied: number; onApply: (index: number) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Try a scenario</CardTitle>
        <CardDescription>Things that happen at Ares Outpost. Apply them in order and watch the Mars manifest change.</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="grid gap-4">
          {EVENTS.map((e, i) => {
            const done = i < applied;
            return (
              <li key={e.title} className="grid grid-cols-[2rem_1fr] gap-x-2">
                <span className={`row-span-3 font-heading text-3xl leading-none font-extrabold ${done ? "text-primary" : "text-muted-foreground"}`}>{i + 1}</span>
                <span className="font-semibold">{e.title}</span>
                <span className="text-sm text-muted-foreground">{e.detail}</span>
                <span className="mt-2">
                  {done ? (
                    <span className="inline-flex items-center gap-1 font-mono text-xs text-primary"><CheckIcon className="size-3.5" /> Applied</span>
                  ) : (
                    <Button size="sm" variant={i === applied ? "default" : "outline"} disabled={i !== applied} onClick={() => onApply(i)}>
                      Apply
                    </Button>
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
