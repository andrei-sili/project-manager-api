// import './globals.css';
// import { Inter } from 'next/font/google';
//
// import AppLayout from '@/components/AppLayout';
//
// const inter = Inter({ subsets: ['latin'] });
// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <body className={inter.className + ' bg-zinc-950 text-white'}>
//         <AppLayout>{children}</AppLayout>
//       </body>
//     </html>
//   );
// }
import './globals.css';
import { Inter } from 'next/font/google';
import AppLayout from '@/components/AppLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ProjectManager',
  description: 'Gestionare proiecte moderne',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-zinc-950 text-white`}>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
