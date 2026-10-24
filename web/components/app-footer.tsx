import Link from "next/link";
import { Wordmark } from "@/components/app-header";

const REPO = "https://github.com/0xNadr/cargo-window";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/", label: "Overview" },
      { href: "/#how-it-works", label: "How it works" },
      { href: "/console/", label: "Console" },
    ],
  },
  {
    title: "Team",
    links: [
      { href: "/admin/idea/", label: "The idea" },
      { href: "/admin/deck/", label: "Pitch deck" },
      { href: "/admin/pitch/", label: "Pitch & demo plan" },
    ],
  },
  {
    title: "Project",
    links: [
      { href: REPO, label: "Source code" },
      { href: `${REPO}/blob/main/docs/ARCHITECTURE.md`, label: "Architecture" },
      { href: `${REPO}/blob/main/docs/AI_DECISIONS.md`, label: "AI decisions" },
    ],
  },
];

export function AppFooter() {
  return (
    <footer className="relative z-10 border-t border-border/70 bg-background/80">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="grid content-start gap-3">
          <Wordmark />
          <p className="max-w-xs text-sm text-muted-foreground">Cargo planning for the first bases on the Moon and Mars. Survival first, fair rules for the rest.</p>
          <p className="text-xs text-muted-foreground">Built for IEEE Lumen 2.0 · Beyond 2030</p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title} className="grid content-start gap-3">
            <p className="text-sm font-medium">{col.title}</p>
            <ul className="grid gap-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  {l.href.startsWith("http") ? (
                    <a href={l.href} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {l.label}
                    </a>
                  ) : (
                    <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/70">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:px-6">
          <span>Example scenario: bases, companies, prices and capacities are invented. Orbital timing, trip length and signal delay are real.</span>
          <span className="font-mono">Mission date 02 May 2035</span>
        </div>
      </div>
    </footer>
  );
}
