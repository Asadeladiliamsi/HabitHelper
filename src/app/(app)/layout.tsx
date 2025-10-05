'use client';

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
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import type { UserProfile } from '@/lib/types';
import { doc, onSnapshot } from 'firebase/firestore';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      setProfileLoading(true);
      const unsub = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          setUserProfile(doc.data() as UserProfile);
        } else {
          // This can happen if the user exists in Auth but not in Firestore.
          // For example, if the Firestore document creation failed during signup.
          setUserProfile(null);
        }
        setProfileLoading(false);
      }, (error) => {
        console.error("Error fetching user profile:", error);
        setUserProfile(null);
        setProfileLoading(false);
      });
      return () => unsub();
    } else if (!authLoading) {
      // If there's no user and auth is not loading, then profile is also not loading.
      setUserProfile(null);
      setProfileLoading(false);
    }
  }, [user, authLoading]);
  
  const loading = authLoading || profileLoading;

  useEffect(() => {
    if (loading) return; // Wait until all loading is done

    const isAuthPage = pathname === '/login' || pathname === '/signup';

    if (!user && !isAuthPage) {
      // If no user and not on an auth page, redirect to login
      router.push('/login');
    } else if (user && !userProfile) {
      // If user exists in Auth but no profile found in Firestore (e.g., failed signup),
      // it's an error state. Redirect to login to be safe.
      console.error("Auth user exists but Firestore profile is missing.");
      router.push('/login');
    } else if (user && userProfile && isAuthPage) {
      // If user is logged in and on an auth page, redirect to dashboard
      router.push('/dashboard');
    }
  }, [loading, user, userProfile, pathname, router]);

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
  
  // If we're loading, or if we're not loading but have no user (and are not on an auth page), show a loader.
  // The useEffect above will handle the redirect.
  if (loading || (!user && pathname !== '/login' && pathname !== '/signup')) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Memuat...</p>
      </div>
    );
  }
   
  // Let the auth pages render themselves without the main layout
  if (pathname === '/login' || pathname === '/signup') {
     return <>{children}</>;
  }

  // After all checks, if we still don't have a profile, it's an invalid state.
  // The useEffect will redirect, but we need to render something in the meantime.
  if (!userProfile) {
     return (
          <div className="flex h-screen items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="ml-2">Sesi tidak valid. Mengalihkan...</p>
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
            {navItems.map((item) => {
              if (!userProfile || !item.roles.includes(userProfile.role)) return null;
              return (
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
            })}
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
