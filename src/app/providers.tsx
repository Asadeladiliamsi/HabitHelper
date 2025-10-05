'use client';

import { ThemeProvider } from 'next-themes';
import { FirebaseProvider } from '@/firebase/provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
    >
      <FirebaseProvider>
        {children}
      </FirebaseProvider>
    </ThemeProvider>
  );
}
