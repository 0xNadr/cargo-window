import type { Metadata } from "next";
import { IBM_Plex_Mono, Schibsted_Grotesk } from "next/font/google";
import { AppFooter } from "@/components/app-footer";
import { AppHeader } from "@/components/app-header";
import { Providers } from "@/components/providers";
import { Starfield } from "@/components/starfield";
import "./globals.css";

const sans = Schibsted_Grotesk({ variable: "--font-schibsted", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const mono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  title: "Cargo Window",
  description: "Plan what flies to the first bases on the Moon and Mars.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${mono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Starfield />
        <Providers>
          <AppHeader />
          <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 pt-8 pb-20 sm:px-6">{children}</main>
          <AppFooter />
        </Providers>
      </body>
    </html>
  );
}
