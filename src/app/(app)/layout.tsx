'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FilePlus2,
  Bell,
  FileText,
  Settings,
  User as UserIcon,
  LogOut,
  Users,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { AuthProvider, useAuth } from '@/components/auth-provider';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { UserRole } from '@/lib/types';


const navItems: Record<UserRole, { href: string; icon: React.ElementType; label: string }[]> = {
  guru: [
    { href: '/guru/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/guru/data-input', icon: FilePlus2, label: 'Input Data' },
    { href: '/guru/notifications', icon: Bell, label: 'Notifikasi' },
    { href: '/guru/reports', icon: FileText, label: 'Laporan' },
  ],
  siswa: [
    { href: '/siswa/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/siswa/my-progress', icon: Users, label: 'Perkembangan Saya' },
  ],
  orangtua: [
    { href: '/orangtua/dashboard', icon: Home, label: 'Dashboard Anak' },
    { href: '/orangtua/reports', icon: FileText, label: 'Laporan Anak' },
  ],
};

function UserMenu() {
    const { userProfile } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast({ title: 'Logout Berhasil' });
            router.push('/login');
        } catch (error) {
            toast({ variant: 'destructive', title: 'Logout Gagal', description: 'Terjadi kesalahan saat mencoba logout.' });
        }
    };
    
    if (!userProfile) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                       <AvatarImage src="#" alt="User avatar" data-ai-hint="user avatar" />
                       <AvatarFallback>
                            {userProfile?.name?.[0].toUpperCase() ?? <UserIcon />}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{userProfile.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {userProfile.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('#')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Pengaturan</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}


function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { userProfile } = useAuth();

  if (!userProfile) return null; // Wait for profile to load

  const currentNavItems = navItems[userProfile.role] || [];

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
              {currentNavItems.map((item) => (
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
                <SidebarMenuButton tooltip={{children: "Settings"}}>
                    <Settings />
                    <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1">
                <span className="text-sm font-semibold capitalize">{userProfile.role} Dashboard</span>
            </div>
            <UserMenu />
          </header>
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <AppLayoutContent>{children}</AppLayoutContent>
        </AuthProvider>
    );
}
