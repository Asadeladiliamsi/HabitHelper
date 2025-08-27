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
        // This case can happen briefly during logout or if profile creation fails.
        // Redirecting to login is a safe fallback.
        router.replace('/login');
        return;
      }

      if (userProfile.role === 'admin') {
        router.replace('/admin/dashboard');
      } else if (userProfile.role === 'orangtua') {
        router.replace('/orangtua/dashboard');
      } else if (userProfile.role === 'siswa' && !userProfile.nisn) {
        // If the user is a student but doesn't have an NISN linked,
        // redirect them to the verification page.
        router.replace('/verify-nisn');
      }
    }
  }, [loading, userProfile, router]);

  if (loading || !userProfile || userProfile.role !== 'siswa' || !userProfile.nisn) {
    // Show a loader while checks are being performed or if the user is not a verified student.
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <StudentProvider>
      <div className="flex flex-col gap-6">
        <SiswaDashboardClient />
      </div>
    </StudentProvider>
  );
}
