// src/components/UIProvider.tsx
"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface UIContextValue {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const UIContext = createContext<UIContextValue | undefined>(undefined);

// Custom hook to use the UI context
export function useUI(): UIContextValue {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}

// Provider component to wrap the app
export default function UIProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <UIContext.Provider value={{ sidebarOpen, toggleSidebar }}>
      {children}
    </UIContext.Provider>
  );
}
