'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardClient } from '@/components/dashboard-client';
import { SiswaDashboardClient } from '@/components/siswa-dashboard-client';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && userProfile?.role === 'admin') {
      router.replace('/admin/dashboard');
    }
  }, [loading, userProfile, router]);


  if (loading || !userProfile || userProfile.role === 'admin') {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
      <div className="flex flex-col gap-6">
        {userProfile?.role === 'siswa' ? <SiswaDashboardClient /> : <DashboardClient />}
      </div>
  );
}
