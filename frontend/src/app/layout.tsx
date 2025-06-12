//  frontend/src/app/layout.tsx
"use client";

import React from "react";
import "./globals.css";
import Providers from "@/components/Providers";

/**
 * RootLayout wraps the entire app with:
 *  - AuthProvider (auth context)
 *  - UIProvider   (UI state: sidebar, theme)
 *  - axios interceptors (via useApiInterceptors hook)
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-zinc-950 min-h-screen flex flex-col">
        {/* All contexts & interceptors are set up here */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
