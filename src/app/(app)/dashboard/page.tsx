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
        // If not logged in at all, go to login page.
        router.replace('/login');
        return;
      }
       
      // This is the CRITICAL check. If the user is a student and does NOT have an NISN,
      // they MUST be redirected to the verification page. This logic acts as a guard.
      if (userProfile.role === 'siswa' && !userProfile.nisn) {
        router.replace('/verify-nisn');
        return;
      }

      // Redirects for other roles
      if (userProfile.role === 'admin') {
        router.replace('/admin/dashboard');
      } else if (userProfile.role === 'orangtua') {
        router.replace('/orangtua/dashboard');
      }
    }
  }, [loading, userProfile, router]);

  // This is the guard that prevents content from flashing for unverified students.
  // While loading, or if the user is a student without an NISN, show a spinner.
  // The useEffect above will handle the actual redirection.
  if (loading || !userProfile || (userProfile.role === 'siswa' && !userProfile.nisn)) {
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
       {userProfile.role === 'siswa' && (
          <div className="flex flex-col gap-6">
            <SiswaDashboardClient />
          </div>
       )}
    </StudentProvider>
  );
}
