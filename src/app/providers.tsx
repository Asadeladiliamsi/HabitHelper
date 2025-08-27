'use client';

import { ThemeProvider } from '@/contexts/theme-provider';
import { LanguageProvider } from '@/contexts/language-provider';
import { AuthProvider } from '@/contexts/auth-context';
import { StudentProvider } from '@/contexts/student-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
    >
      <LanguageProvider>
        <AuthProvider>
          <StudentProvider>
            {children}
          </StudentProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}