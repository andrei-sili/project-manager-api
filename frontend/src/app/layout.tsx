// frontend/src/app/layout.tsx

import React from 'react';
import './globals.css';
import { Inter } from 'next/font/google';

export const metadata = {
  title: 'Project Manager',
  description: 'Manage your projects efficiently',
};

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className={inter.className}>
      <body>
        {children}
      </body>
    </html>
  );
}