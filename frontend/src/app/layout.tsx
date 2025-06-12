// frontend/src/app/layout.tsx
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata = {
  title: "Project Manager",
  description: "A modern, extensible project management tool",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-white min-h-screen">
        {/* Doar context providers aici */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
