// frontend/src/app/layout.tsx

import React from "react";
import "./globals.css";
import UIProvider from "../components/UIProvider";
import AuthProvider from "../components/AuthProvider"; // <-- IMPORT!

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-zinc-950 min-h-screen flex flex-col">
        {/* Wrap everything with AuthProvider and UIProvider */}
        <AuthProvider>
          <UIProvider>
            {children}
          </UIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
