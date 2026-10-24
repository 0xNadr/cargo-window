import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A section of the admin pages: a label column and a content column on wide screens. */
export function DocSection({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section className="grid gap-x-10 gap-y-4 lg:grid-cols-[240px_minmax(0,1fr)]">
      <header className="grid content-start gap-1.5">
        <p className="label-caps text-xs text-muted-foreground">{eyebrow}</p>
        <h2 className="font-heading text-3xl leading-[0.95] font-extrabold tracking-wide uppercase">{title}</h2>
      </header>
      <div className="grid min-w-0 gap-4">{children}</div>
    </section>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return <div className="grid max-w-[66ch] gap-3 text-base text-muted-foreground [&_strong]:font-semibold [&_strong]:text-foreground">{children}</div>;
}

export function Bullets({ items, ordered = false }: { items: ReactNode[]; ordered?: boolean }) {
  const List = ordered ? "ol" : "ul";
  return (
    <List className={cn("grid max-w-[66ch] gap-2 pl-5 text-muted-foreground [&_strong]:font-semibold [&_strong]:text-foreground", ordered ? "list-decimal" : "list-disc")}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </List>
  );
}

export function Callout({ children }: { children: ReactNode }) {
  return <p className="max-w-[72ch] rounded-lg border border-primary bg-primary/10 p-4 text-base">{children}</p>;
}

export function Kind({ kind }: { kind: "AI" | "RULES" | "PEOPLE" }) {
  const tone = kind === "AI" ? "text-primary" : kind === "RULES" ? "text-life" : "text-muted-foreground";
  return <span className={cn("inline-block rounded-sm border border-current px-1.5 font-mono text-[11px] tracking-wider", tone)}>{kind}</span>;
}
