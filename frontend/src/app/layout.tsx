// frontend/src/app/layout.tsx
// import "./globals.css";
// import AuthProvider from "@/components/AuthProvider";
// import UIProvider from "@/components/UIProvider";
// import ToastProvider from "@/components/ToastProvider";
// import NextTopLoader from "nextjs-toploader";
//
// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <body className="bg-zinc-950 text-white">
//         <AuthProvider>
//           <UIProvider>
//             <ToastProvider>
//               {/* Global top progress bar for route loading */}
//               <NextTopLoader color="#0EA5E9" showSpinner={false} />
//               {children}
//             </ToastProvider>
//           </UIProvider>
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }


// frontend/src/app/layout.tsx

import React from "react";
import "./globals.css";
import Sidebar from "../components/Sidebar";
import { Header } from "@/components/Header";
import UIProvider from "../components/UIProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-zinc-950 min-h-screen flex flex-col">
        {/* UIProvider WRAP  */}
        <UIProvider>
          <div className="flex flex-1 h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-auto">
              <Header />
              <main className="flex-1 p-6 overflow-y-auto">{children}</main>
            </div>
          </div>
        </UIProvider>
      </body>
    </html>
  );
}
