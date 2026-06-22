import type { Metadata } from "next";
import { IBM_Plex_Mono, Special_Elite } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const specialElite = Special_Elite({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-special-elite",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
});

export const metadata: Metadata = {
  title: "Snack Surge — Fighter Card Gallery",
  description: "Lite card and avatar showcase with React Bits DomeGallery and FluidGlass.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(specialElite.variable, ibmPlexMono.variable)}>
      <body>{children}</body>
    </html>
  );
}
