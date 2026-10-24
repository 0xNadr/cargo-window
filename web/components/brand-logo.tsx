import Image from "next/image";
import { cn } from "@/lib/utils";

/** The Cargo Window mission patch. Small sizes use the 128 px file, large ones the 512 px file. */
export function BrandLogo({ size = 32, className, priority = false }: { size?: number; className?: string; priority?: boolean }) {
  return (
    <Image
      src={size > 96 ? "/brand/logo-512.png" : "/brand/logo-128.png"}
      alt=""
      aria-hidden
      width={size}
      height={size}
      priority={priority}
      className={cn("shrink-0 select-none", className)}
    />
  );
}
