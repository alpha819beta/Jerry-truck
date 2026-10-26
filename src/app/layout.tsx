import type { Metadata } from "next";
import { Oswald, Source_Sans_3 } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald" });
const source = Source_Sans_3({ subsets: ["latin"], variable: "--font-source" });

export const metadata: Metadata = {
  title: { default: `${site.name} | Hauling, Landscaping & Transport`, template: `%s | ${site.name}` },
  description:
    "Gravel, rock, mulch, soil and sand delivered. Hauling, landscaping and transport. Call or text 681-220-0257.",
  icons: { icon: "/brand/logo-round.webp" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${oswald.variable} ${source.variable}`}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
