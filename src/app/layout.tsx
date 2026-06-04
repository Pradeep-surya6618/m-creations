import type { Metadata } from "next";
import { Great_Vibes, Quicksand } from "next/font/google";
import "./globals.css";

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:4000"),
  title: {
    default: "Maria Creations · Handmade Flowers",
    template: "%s · Maria Creations",
  },
  description:
    "Handmade flowers crafted with love. Bouquets, candle florals, and decorative pieces from Udumalpet.",
  openGraph: {
    title: "Maria Creations · Handmade Flowers",
    description: "Handmade flowers crafted with love. Made in Udumalpet.",
    siteName: "Maria Creations",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${greatVibes.variable} ${quicksand.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-brand-cream text-brand-ink">
        {children}
      </body>
    </html>
  );
}
