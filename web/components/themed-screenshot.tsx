import Image from "next/image";
import { cn } from "@/lib/utils";

/** A product screenshot that matches the active theme: `<name>-light.jpg` in light mode, `<name>.jpg` in dark mode. */
export function ThemedScreenshot({ name, alt, className, priority = false }: { name: string; alt: string; className?: string; priority?: boolean }) {
  return (
    <>
      <Image src={`/screenshots/${name}-light.jpg`} alt={alt} width={1440} height={742} priority={priority} className={cn("h-auto w-full dark:hidden", className)} />
      <Image src={`/screenshots/${name}.jpg`} alt={alt} width={1440} height={742} priority={priority} className={cn("hidden h-auto w-full dark:block", className)} />
    </>
  );
}
