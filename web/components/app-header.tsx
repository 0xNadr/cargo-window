"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRightIcon, BookOpenIcon, CircleHelpIcon, HomeIcon, LayoutDashboardIcon, LightbulbIcon, ListChecksIcon, PresentationIcon } from "lucide-react";
import { GuideDialog } from "@/components/guide-dialog";
import { useGuide, useServer } from "@/components/providers";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 font-[family-name:var(--font-wordmark)] text-xl font-extrabold tracking-wider uppercase", className)}>
      <svg viewBox="0 0 30 30" aria-hidden className="size-6 fill-none stroke-primary stroke-2">
        <rect x="3" y="8" width="24" height="16" rx="1.5" />
        <path d="M3 13.5h24M10.5 8v16M19.5 8v16" />
        <circle cx="15" cy="4" r="1.6" className="fill-primary stroke-none" />
      </svg>
      Cargo Window
    </Link>
  );
}

const NAV = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#why-mars", label: "Why Mars" },
  { href: "/#different", label: "What's different" },
  { href: "/console/", label: "Console" },
];

function AiStatus() {
  const server = useServer();
  const [label, tone, help] = !server.checked
    ? ["Connecting", "bg-muted-foreground", "Checking whether the Earth server is reachable."]
    : server.ai
      ? ["Claude online", "bg-ok", `The Earth server reads requests and writes briefs with ${server.model}.`]
      : server.up
        ? ["No AI key", "bg-primary", "The Earth server is up but has no Claude key. The offline reader and brief template are used."]
        : ["Offline", "bg-primary", "The Earth server is not reachable. Planning continues in this browser; requests are read by the offline reader."];
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="hidden items-center gap-2 rounded-full border px-2.5 py-1 text-xs text-muted-foreground md:inline-flex" />}>
        <span className={cn("size-1.5 rounded-full", tone)} />
        {label}
      </TooltipTrigger>
      <TooltipContent className="max-w-64">{help}</TooltipContent>
    </Tooltip>
  );
}

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const guide = useGuide();
  const onConsole = pathname.startsWith("/console");

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/75 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Wordmark />
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const active = item.href === "/console/" ? onConsole : false;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn("rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground", active && "text-foreground")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <AiStatus />
          <Tooltip>
            <TooltipTrigger render={<Button variant="ghost" size="icon" onClick={() => guide.setOpen(true)} aria-label="How it works" />}>
              <CircleHelpIcon />
            </TooltipTrigger>
            <TooltipContent>How it works</TooltipContent>
          </Tooltip>
          {!onConsole && (
            <Link href="/console/" className={cn(buttonVariants({ size: "sm" }), "h-8 px-3")}>
              Open the console <ArrowRightIcon />
            </Link>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="rounded-full" aria-label="Open the profile menu" />}>
              <Avatar size="sm">
                <AvatarFallback className="bg-primary/15 text-[11px] font-medium text-primary">CO</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  <span className="block text-sm text-foreground">Cargo officer</span>
                  <span className="block font-normal">Earth cargo desk</span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => router.push("/")}>
                  <HomeIcon /> Home
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/console/")}>
                  <LayoutDashboardIcon /> Console
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => guide.setOpen(true)}>
                  <BookOpenIcon /> How it works
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>Admin</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => router.push("/admin/idea/")}>
                  <LightbulbIcon /> The idea
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/admin/deck/")}>
                  <PresentationIcon /> Pitch deck
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/admin/pitch/")}>
                  <ListChecksIcon /> Pitch &amp; demo plan
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <GuideDialog />
    </header>
  );
}
