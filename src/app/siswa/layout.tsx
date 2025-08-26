'use client';

import AppLayout from '@/app/(app)/layout';
import type { NavItem } from '@/app/(app)/layout';
import { LayoutDashboard, FileText } from 'lucide-react';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';

export default function SiswaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { language } = useLanguage();
  // This is a placeholder, you might want to create specific student translations
  const t = translations[language] || translations.en;

  const siswaNavItems: NavItem[] = [
    { href: '/siswa/dashboard', icon: LayoutDashboard, label: t.sidebar.dashboard },
    // Add more student-specific menu items here if needed
  ];

  return <AppLayout navItems={siswaNavItems}>{children}</AppLayout>;
}
