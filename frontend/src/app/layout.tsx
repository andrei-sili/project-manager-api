// frontend/src/app/layout.tsx
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import UIProvider from "@/components/UIProvider";
import ToastProvider from "@/components/ToastProvider";
import NextTopLoader from "nextjs-toploader";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-white">
        <AuthProvider>
          <UIProvider>
            <ToastProvider>
              {/* Global top progress bar for route loading */}
              <NextTopLoader color="#0EA5E9" showSpinner={false} />
              {children}
            </ToastProvider>
          </UIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
