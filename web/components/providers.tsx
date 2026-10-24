"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { api } from "@/lib/api";

export interface ServerStatus {
  checked: boolean;
  up: boolean;
  ai: boolean;
  model: string | null;
}

const ServerContext = createContext<ServerStatus>({ checked: false, up: false, ai: false, model: null });
const GuideContext = createContext<{ open: boolean; setOpen: (open: boolean) => void }>({ open: false, setOpen: () => {} });

export const useServer = () => useContext(ServerContext);
export const useGuide = () => useContext(GuideContext);

export function Providers({ children }: { children: ReactNode }) {
  const [server, setServer] = useState<ServerStatus>({ checked: false, up: false, ai: false, model: null });
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    api
      .health()
      .then((h) => setServer({ checked: true, up: true, ai: h.ai, model: h.model }))
      .catch(() => setServer({ checked: true, up: false, ai: false, model: null }));
  }, []);

  return (
    <ServerContext.Provider value={server}>
      <GuideContext.Provider value={{ open: guideOpen, setOpen: setGuideOpen }}>
        <TooltipProvider>
          {children}
          <Toaster theme="dark" position="bottom-right" />
        </TooltipProvider>
      </GuideContext.Provider>
    </ServerContext.Provider>
  );
}
