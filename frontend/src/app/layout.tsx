import "./globals.css";
import type { ReactNode } from "react";
import { Space_Grotesk } from "next/font/google";
import Providers from "@/components/Providers";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata = {
  title: "Project Manager",
  description:
    "A modern team collaboration platform: Kanban boards, time tracking, roles and real-time updates.",
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
