'use client';

import { ThemeProvider } from '@/contexts/theme-provider';
import { LanguageProvider } from '@/contexts/language-provider';
import { StudentProvider } from '@/contexts/student-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
    >
      <LanguageProvider>
        <StudentProvider>
          {children}
        </StudentProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
