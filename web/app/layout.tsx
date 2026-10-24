import type { Metadata } from "next";
import { Barlow, Barlow_Condensed, Big_Shoulders_Stencil, IBM_Plex_Mono } from "next/font/google";
import { AppHeader } from "@/components/app-header";
import { Providers } from "@/components/providers";
import { Starfield } from "@/components/starfield";
import "./globals.css";

const barlow = Barlow({ variable: "--font-barlow", subsets: ["latin"], weight: ["400", "500", "600"] });
const barlowCondensed = Barlow_Condensed({ variable: "--font-barlow-condensed", subsets: ["latin"], weight: ["600", "700"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500"] });
const stencil = Big_Shoulders_Stencil({ variable: "--font-stencil", subsets: ["latin"], weight: ["700", "800"] });

export const metadata: Metadata = {
  title: "Cargo Window",
  description: "Plan what flies to the first bases on the Moon and Mars.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${barlow.variable} ${barlowCondensed.variable} ${plexMono.variable} ${stencil.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Starfield />
        <Providers>
          <AppHeader />
          <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 pt-6 pb-16 sm:px-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
