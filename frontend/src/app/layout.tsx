// frontend/src/app/layout.tsx

// import React from "react";
// import "./globals.css";
// import UIProvider from "../components/UIProvider";
// import AuthProvider from "../components/AuthProvider";
//
// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en">
//       <body className="bg-gray-50 dark:bg-zinc-950 min-h-screen flex flex-col">
//         {/* Wrap everything with AuthProvider and UIProvider */}
//         <AuthProvider>
//           <UIProvider>
//             {children}
//           </UIProvider>
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }


// frontend/src/app/layout.tsx
import React from 'react';
import './globals.css';
import { Inter } from 'next/font/google';
import Providers from '../components/Providers';

export const metadata = {
  title: 'Project Manager',
  description: 'Manage your projects efficiently',
};

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className={inter.className}>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
