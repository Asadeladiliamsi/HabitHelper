'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FilePlus2,
  Bell,
  FileText,
  Settings,
  Users,
  Pencil,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons/logo';
import { StudentProvider } from '@/contexts/student-context';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const navItems = [
    { href: '/guru/dashboard', icon: LayoutDashboard, label: t.sidebar.dashboard },
    { href: '/guru/data-input', icon: FilePlus2, label: t.sidebar.dataInput },
    { href: '/guru/manage-students', icon: Users, label: t.sidebar.manageStudents },
    { href: '/guru/edit-scores', icon: Pencil, label: t.sidebar.editScores },
    { href: '/guru/notifications', icon: Bell, label: t.sidebar.notifications },
    { href: '/guru/reports', icon: FileText, label: t.sidebar.reports },
  ];

  return (
    <StudentProvider>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2">
              <Logo />
              <span className="font-bold text-xl text-primary group-data-[collapsible=icon]:hidden">
                HabitHelper
              </span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                   <Link href={item.href}>
                    <SidebarMenuButton
                      isActive={pathname.startsWith(item.href)}
                      tooltip={{ children: item.label }}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/settings">
                  <SidebarMenuButton
                    isActive={pathname.startsWith('/settings')}
                    tooltip={{ children: t.sidebar.settings }}
                  >
                    <Settings />
                    <span>{t.sidebar.settings}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1">
                <span className="text-sm font-semibold capitalize">{t.sidebar.teacherDashboard}</span>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </StudentProvider>
  );
}
