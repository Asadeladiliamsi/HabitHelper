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
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';

export interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const navItems: NavItem[] = [
    { href: '/dashboard', icon: LayoutDashboard, label: t.sidebar.dashboard },
    { href: '/data-input', icon: FilePlus2, label: t.sidebar.dataInput },
    { href: '/manage-students', icon: Users, label: t.sidebar.manageStudents },
    { href: '/edit-scores', icon: Pencil, label: t.sidebar.editScores },
    { href: '/notifications', icon: Bell, label: t.sidebar.notifications },
    { href: '/reports', icon: FileText, label: t.sidebar.reports },
  ];

  const getRoleTitle = () => {
    if (pathname.startsWith('/siswa')) {
      return 'Dasbor Siswa';
    }
    if (pathname.startsWith('/orangtua')) {
      return 'Dasbor Orang Tua';
    }
    return t.sidebar.teacherDashboard;
  };

  return (
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
                      isActive={pathname === item.href}
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
                    isActive={pathname === '/settings'}
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
                <span className="text-sm font-semibold capitalize">{getRoleTitle()}</span>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
  );
}
