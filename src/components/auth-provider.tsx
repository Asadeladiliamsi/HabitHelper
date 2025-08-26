'use client';

import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { getUserProfile } from '@/services/user-service';
import type { UserProfile } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
}

const AuthContext = createContext<AuthContextType>({ user: null, userProfile: null });

export const useAuth = () => useContext(AuthContext);

const PUBLIC_ROUTES = ['/', '/login', '/register'];
const GUEST_ONLY_ROUTES = ['/login', '/register'];

const getDashboardRouteForRole = (role: string) => {
    switch (role) {
        case 'guru':
            return '/guru/dashboard';
        case 'siswa':
            return '/siswa/dashboard';
        case 'orangtua':
            return '/orangtua/dashboard';
        default:
            return '/login';
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route) && (route.length === 1 || pathname.length === route.length || route.endsWith('*')));
    const isGuestOnlyRoute = GUEST_ONLY_ROUTES.includes(pathname);

    if (user && userProfile) {
        // If user is logged in
        const dashboardRoute = getDashboardRouteForRole(userProfile.role);
        // and tries to access login/register, or is on the landing page, redirect to their dashboard
        if (isGuestOnlyRoute || pathname === '/') {
            router.push(dashboardRoute);
        }
    } else if (!user && !isPublicRoute) {
        // If user is not logged in and tries to access a protected route
        router.push('/login');
    }

  }, [user, userProfile, loading, router, pathname]);

  if (loading) {
     return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <AuthContext.Provider value={{ user, userProfile }}>{children}</AuthContext.Provider>;
}
