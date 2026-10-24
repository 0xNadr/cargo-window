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

function AiStatus() {
  const server = useServer();
  const [label, tone, help] = !server.checked
    ? ["Connecting…", "bg-muted-foreground", "Checking whether the Earth server is reachable."]
    : server.ai
      ? ["Claude online", "bg-ok", `The Earth server reads requests and writes briefs with ${server.model}.`]
      : server.up
        ? ["Server, no AI key", "bg-primary", "The Earth server is up but has no Claude key. The offline reader and brief template are used."]
        : ["Offline: base copy", "bg-primary", "The Earth server is not reachable. Planning continues in this browser; requests are read by the offline reader."];
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span className="hidden items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs text-muted-foreground sm:inline-flex" />
        }
      >
        <span className={cn("size-2 rounded-full", tone)} />
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
  const isAdmin = pathname.startsWith("/admin");

  return (
    <header className="relative z-20 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-heading text-2xl font-extrabold tracking-wider uppercase">
          <svg viewBox="0 0 30 30" aria-hidden className="size-7 fill-none stroke-primary stroke-2">
            <rect x="3" y="8" width="24" height="16" rx="1.5" />
            <path d="M3 13.5h24M10.5 8v16M19.5 8v16" />
            <circle cx="15" cy="4" r="1.6" className="fill-primary stroke-none" />
          </svg>
          Cargo Window
        </Link>
        {isAdmin && (
          <span className="rounded-full border border-primary/50 px-2 py-0.5 font-mono text-[11px] tracking-wider text-primary uppercase">
            Admin view
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden font-mono text-xs text-muted-foreground lg:inline">Mission date 02 MAY 2035</span>
          <AiStatus />
          <Button variant="ghost" size="sm" onClick={() => guide.setOpen(true)}>
            <CircleHelpIcon />
            <span className="hidden sm:inline">How it works</span>
          </Button>
          {!pathname.startsWith("/console") && (
            <Link href="/console/" className={buttonVariants({ size: "sm" })}>
              <span className="hidden sm:inline">Open the console</span>
              <span className="sm:hidden">Console</span>
              <ArrowRightIcon />
            </Link>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="rounded-full" aria-label="Open the profile menu" />}>
              <Avatar>
                <AvatarFallback className="bg-primary/15 font-mono text-xs text-primary">CO</AvatarFallback>
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
