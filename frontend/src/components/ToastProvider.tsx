// src/components/ToastProvider.tsx
"use client";
import { Toaster } from "react-hot-toast";
import { ReactNode } from "react";

export default function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      {/* Global toast container */}
      <Toaster position="top-right" reverseOrder={false} toastOptions={{ duration: 5000 }} />
    </>
  );
}
