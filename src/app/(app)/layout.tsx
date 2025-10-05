'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Bell,
  FileText,
  Settings,
  LogOut,
  Loader2,
  Database,
  PencilLine,
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
import { ThemeToggle } from '@/components/theme-toggle';
import { useUserProfile } from '@/hooks/use-user-profile';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile, loading } = useUserProfile();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);
  
  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const getDashboardTitle = () => {
    if (!userProfile) return 'Dasbor';
    switch (userProfile.role) {
      case 'guru':
        return 'Dasbor Guru';
      case 'siswa':
        return 'Dasbor Siswa';
      case 'admin':
        return 'Dasbor Admin';
      case 'orangtua':
        return 'Dasbor Orang Tua';
      default:
        return 'Dasbor';
    }
  };
  
  if (loading || !user) {
     return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  const dashboardTitle = getDashboardTitle();
  const dashboardPath = userProfile?.role === 'admin' ? '/admin/dashboard' : '/dashboard';

  const navItems = [
    { href: dashboardPath, icon: LayoutDashboard, label: 'Dasbor', roles: ['guru', 'siswa', 'admin', 'orangtua'] },
    { href: '/input-data', icon: PencilLine, label: 'Input Data Harian', roles: ['siswa'] },
    { href: '/orangtua/input-data', icon: PencilLine, label: 'Input Data Anak', roles: ['orangtua'] },
    { href: '/data-master', icon: Database, label: 'Data Master', roles: ['guru', 'admin'] },
    { href: '/notifications', icon: Bell, label: 'Notifikasi', roles: ['guru', 'admin'] },
    { href: '/reports', icon: FileText, label: 'Laporan', roles: ['guru', 'admin'] },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            
            <span className="font-bold text-xl text-primary group-data-[collapsible=icon]:hidden">
              Kaih.Spensa id
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              userProfile && item.roles.includes(userProfile.role) && (
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
              )
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/settings">
                <SidebarMenuButton
                  isActive={pathname === '/settings'}
                  tooltip={{ children: 'Pengaturan' }}
                >
                  <Settings />
                  <span>{'Pengaturan'}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                tooltip={{ children: 'Keluar' }}
                className="w-full"
              >
                <LogOut />
                <span>{'Keluar'}</span>
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
                {dashboardTitle}
              </span>
              <span className="text-sm text-muted-foreground ml-2">({user?.email})</span>
          </div>
            <ThemeToggle />
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
