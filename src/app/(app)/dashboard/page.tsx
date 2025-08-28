'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardClient } from '@/components/dashboard-client';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import { StudentProvider } from '@/contexts/student-context';
import { SiswaDashboardClient } from '@/components/siswa-dashboard-client';

export default function DashboardPage() {
  const { userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!userProfile) {
        router.replace('/login');
        return;
      }
       
      if (userProfile.role === 'admin') {
        router.replace('/admin/dashboard');
      } else if (userProfile.role === 'orangtua') {
        router.replace('/orangtua/dashboard');
      } else if (userProfile.role === 'siswa' && !userProfile.nisn) {
        // This is a crucial final check. If a student without NISN lands here,
        // force them back to verification.
        router.replace('/verify-nisn');
      }
    }
  }, [loading, userProfile, router]);

  // Stricter condition: loading, no profile, or a role that should be redirected
  // OR a student who is not yet verified. This prevents the dashboard from flashing
  // before the redirect happens.
  if (loading || !userProfile || userProfile.role === 'admin' || userProfile.role === 'orangtua' || (userProfile.role === 'siswa' && !userProfile.nisn)) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <StudentProvider>
       {userProfile.role === 'guru' && (
          <div className="flex flex-col gap-6">
            <DashboardClient />
          </div>
       )}
       {userProfile.role === 'siswa' && userProfile.nisn && ( // Render only if verified
          <div className="flex flex-col gap-6">
            <SiswaDashboardClient />
          </div>
       )}
    </StudentProvider>
  );
}
