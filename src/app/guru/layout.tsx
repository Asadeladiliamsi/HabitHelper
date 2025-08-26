'use client';

import AppLayout from '@/app/(app)/layout';
import type { NavItem } from '@/app/(app)/layout';
import {
  LayoutDashboard,
  FilePlus2,
  Bell,
  FileText,
  Users,
  Pencil,
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';

export default function GuruLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  
  const guruNavItems: NavItem[] = [
    { href: '/guru/dashboard', icon: LayoutDashboard, label: t.sidebar.dashboard },
    { href: '/guru/data-input', icon: FilePlus2, label: t.sidebar.dataInput },
    { href: '/guru/manage-students', icon: Users, label: t.sidebar.manageStudents },
    { href: '/guru/edit-scores', icon: Pencil, label: t.sidebar.editScores },
    { href: '/guru/notifications', icon: Bell, label: t.sidebar.notifications },
    { href: '/guru/reports', icon: FileText, label: t.sidebar.reports },
  ];

  return <AppLayout navItems={guruNavItems}>{children}</AppLayout>;
}
