'use client';

import { ThemeProvider } from '@/contexts/theme-provider';
import { LanguageProvider } from '@/contexts/language-provider';
import { StudentProvider } from '@/contexts/student-context';
import { AuthProvider } from '@/contexts/auth-context';

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
