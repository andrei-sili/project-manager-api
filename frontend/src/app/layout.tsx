import "./globals.css";
import type { ReactNode } from "react";
import { Space_Grotesk } from "next/font/google";
import Providers from "@/components/Providers";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pm.andreisili.com";
const description =
  "A modern team collaboration platform: Kanban boards, time tracking, roles and real-time updates.";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: "Project Manager",
  description,
  openGraph: {
    title: "Project Manager",
    description,
    url: siteUrl,
    siteName: "Project Manager",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Project Manager",
    description,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body className="min-h-screen bg-zinc-950 font-sans text-zinc-100 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
