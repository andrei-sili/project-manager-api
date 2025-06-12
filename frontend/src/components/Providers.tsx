// frontend/src/components/Providers.tsx
import React from 'react';
import AuthProvider from './AuthProvider';
import UIProvider from './UIProvider';


type ProvidersProps = {
  children: React.ReactNode;
};

/**
 * Wrap all context providers here so that
 * useAuth, useUI, etc. always find their context.
 */
export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <UIProvider>
        {/* <ThemeProvider> */}
          {/* <NotificationProvider> */}
            {children}
          {/* </NotificationProvider> */}
        {/* </ThemeProvider> */}
      </UIProvider>
    </AuthProvider>
  );
}
