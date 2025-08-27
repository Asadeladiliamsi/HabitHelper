'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FilePlus2,
  Bell,
  FileText,
  Settings,
  Users,
  Pencil,
  LogOut,
  Loader2,
  Shield,
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
import { useAuth } from '@/contexts/auth-context';
import { UserProvider } from '@/contexts/user-context';
import { StudentProvider } from '@/contexts/student-context';

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
  const router = useRouter();
  const { language } = useLanguage();
  const { user, userProfile, loading, logout } = useAuth();
  const t = translations[language] || translations.en;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  const guruNavItems: NavItem[] = [
    { href: '/dashboard', icon: LayoutDashboard, label: t.sidebar.dashboard },
    { href: '/data-input', icon: FilePlus2, label: t.sidebar.dataInput },
    { href: '/manage-students', icon: Users, label: t.sidebar.manageStudents },
    { href: '/edit-scores', icon: Pencil, label: t.sidebar.editScores },
    { href: '/notifications', icon: Bell, label: t.sidebar.notifications },
    { href: '/reports', icon: FileText, label: t.sidebar.reports },
  ];

  const siswaNavItems: NavItem[] = [
    { href: '/dashboard', icon: LayoutDashboard, label: t.sidebar.dashboard },
    { href: '/reports', icon: FileText, label: t.sidebar.reports },
  ];
  
  const adminNavItems: NavItem[] = [
    { href: '/admin/dashboard', icon: Shield, label: 'Dasbor Admin' },
  ];

  const getNavItems = () => {
    switch (userProfile?.role) {
      case 'siswa':
        return siswaNavItems;
      case 'guru':
        return guruNavItems;
      case 'admin':
        return adminNavItems;
      default:
        return [];
    }
  }

  const navItems = getNavItems();

  if (loading || !user) {
     return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const getDashboardTitle = () => {
    switch (userProfile?.role) {
      case 'guru':
        return t.sidebar.teacherDashboard;
      case 'siswa':
        return 'Dasbor Siswa';
      case 'admin':
        return 'Dasbor Admin';
      default:
        return 'Dasbor';
    }
  };

  return (
    <UserProvider>
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
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={logout}
                    tooltip={{ children: t.sidebar.logout }}
                    className="w-full"
                  >
                    <LogOut />
                    <span>{t.sidebar.logout}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6">
              <SidebarTrigger className="md:hidden" />
              <div className="flex-1">
                  <span className="font-semibold capitalize text-sm">
                    {getDashboardTitle()}
                  </span>
                  <span className="text-sm text-muted-foreground ml-2">({user?.email})</span>
              </div>
            </header>
            <main className="flex-1 p-4 sm:p-6">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </StudentProvider>
    </UserProvider>
  );
}
