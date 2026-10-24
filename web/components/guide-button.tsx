"use client";

import { CircleHelpIcon } from "lucide-react";
import { useGuide } from "@/components/providers";
import { Button } from "@/components/ui/button";

export function GuideButton({ label = "How it works" }: { label?: string }) {
  const guide = useGuide();
  return (
    <Button variant="outline" size="lg" onClick={() => guide.setOpen(true)}>
      <CircleHelpIcon /> {label}
    </Button>
  );
}
