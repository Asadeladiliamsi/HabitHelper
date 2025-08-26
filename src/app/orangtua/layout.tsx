'use client';

import AppLayout from '@/app/(app)/layout';
import type { NavItem } from '@/app/(app)/layout';
import { LayoutDashboard, User, FileText } from 'lucide-react';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';

export default function OrangTuaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { language } = useLanguage();
  // This is a placeholder, you might want to create specific parent translations
  const t = translations[language] || translations.en; 
  
  const orangTuaNavItems: NavItem[] = [
    { href: '/orangtua/dashboard', icon: LayoutDashboard, label: t.sidebar.dashboard },
    // Add more parent-specific menu items here if needed
  ];

  return <AppLayout navItems={orangTuaNavItems}>{children}</AppLayout>;
}
