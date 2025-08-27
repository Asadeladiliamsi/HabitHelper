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
      if (userProfile?.role === 'admin') {
        router.replace('/admin/dashboard');
      } else if (userProfile?.role === 'orangtua') {
        router.replace('/orangtua/dashboard');
      }
    }
  }, [loading, userProfile, router]);

  if (loading || !userProfile || userProfile.role === 'admin' || userProfile.role === 'orangtua') {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <StudentProvider>
      <div className="flex flex-col gap-6">
        {userProfile?.role === 'siswa' ? <SiswaDashboardClient /> : <DashboardClient />}
      </div>
    </StudentProvider>
  );
}
