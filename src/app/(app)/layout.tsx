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
    // This effect handles fetching the user's profile from Firestore
    // ONLY when the user object from useAuth is available.
    if (user) {
      setProfileLoading(true);
      const unsub = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          setUserProfile(doc.data() as UserProfile);
        } else {
          // User exists in Auth, but not in Firestore. This is an invalid state.
          console.error("Firestore profile missing for authenticated user:", user.uid);
          setUserProfile(null);
        }
        setProfileLoading(false);
      }, (error) => {
        console.error("Error fetching user profile:", error);
        setUserProfile(null);
        setProfileLoading(false);
      });
      return () => unsub(); // Cleanup the listener
    } else if (!authLoading) {
      // If there's no user and auth is not loading, we are done.
      setUserProfile(null);
      setProfileLoading(false);
    }
  }, [user, authLoading]);

  // Combined loading state
  const loading = authLoading || profileLoading;

  useEffect(() => {
    // This effect handles redirection logic safely AFTER all loading is complete.
    if (loading) return;

    const isAuthPage = pathname === '/login' || pathname === '/signup';

    if (!user) {
      // Not logged in. If not on an auth page, redirect to login.
      if (!isAuthPage) {
        router.push('/login');
      }
    } else {
      // Logged in.
      if (!userProfile) {
        // Logged in, but profile data is missing. This is an error state.
        // For safety, log out and redirect to login to restart the process.
        console.error("Redirecting to login due to missing user profile.");
        signOut(auth); 
      } else if (isAuthPage) {
        // Logged in and on an auth page, redirect to the correct dashboard.
        const dashboardPath = userProfile.role === 'admin' ? '/admin/dashboard' : '/dashboard';
        router.push(dashboardPath);
      }
    }
  }, [loading, user, userProfile, pathname, router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };
  
  // Show a global loader while we are resolving auth state and profile data.
  // Or if we are in a redirecting state.
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Memuat...</p>
      </div>
    );
  }
   
  // If user is not logged in, render children (which would be login/signup pages).
  // The useEffect above handles redirecting from protected pages.
  if (!user || !userProfile) {
     return <>{children}</>;
  }
  
  const dashboardPath = userProfile.role === 'admin' ? '/admin/dashboard' : '/dashboard';

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
                Dasbor {userProfile.role}
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
