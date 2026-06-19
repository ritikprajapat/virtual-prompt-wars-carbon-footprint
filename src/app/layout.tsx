import type { Metadata } from "next";
import { Syne, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { RouteFocus } from "@/components/RouteFocus";

const syne = Syne({ subsets: ["latin"], variable: "--font-syne", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CarbonTrace – Carbon Footprint Awareness Platform",
  description:
    "Track and reduce your everyday carbon footprint through simple actions and personalised AI insights.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <RouteFocus />
        <div className="app-layout">
          <Sidebar />
          <main id="main-content" className="main-content" tabIndex={-1}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
