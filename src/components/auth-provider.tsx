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
      setLoading(true);
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

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const isGuestOnlyRoute = GUEST_ONLY_ROUTES.includes(pathname);
    
    if (user && userProfile) {
      const dashboardRoute = getDashboardRouteForRole(userProfile.role);
      // If user is logged in and tries to access guest-only pages, redirect to dashboard
      if (isGuestOnlyRoute) {
        router.push(dashboardRoute);
      }
    } else if (!user && !isPublicRoute) {
      // If user is not logged in and tries to access a protected route, redirect to login
      router.push('/login');
    }

  }, [loading, user, userProfile, pathname, router]);

  if (loading) {
     return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Render children only when loading is complete and routing logic has been checked
  // This prevents rendering a page briefly before redirecting
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  if (!loading && !user && !isPublicRoute) {
    return null; // Don't render protected routes while redirecting to login
  }
  
  const isGuestOnlyRoute = GUEST_ONLY_ROUTES.includes(pathname);
  if (!loading && user && isGuestOnlyRoute) {
      return null; // Don't render login/register while redirecting to dashboard
  }

  return <AuthContext.Provider value={{ user, userProfile }}>{children}</AuthContext.Provider>;
}
