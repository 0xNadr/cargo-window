"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin/idea/", label: "The idea" },
  { href: "/admin/deck/", label: "Pitch deck" },
  { href: "/admin/pitch/", label: "Pitch & demo" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm" aria-label="Admin pages">
      {LINKS.map((l) => {
        const active = pathname.replace(/\/?$/, "/") === l.href;
        return (
          <Link key={l.href} href={l.href} aria-current={active ? "page" : undefined} className={cn("rounded-md px-3 py-1.5 transition-colors hover:bg-muted", active && "bg-primary/15 text-primary")}>
            {l.label}
          </Link>
        );
      })}
      <Link href="/console/" className="ml-1 inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
        <ArrowLeftIcon className="size-4" /> Back to the console
      </Link>
    </nav>
  );
}
