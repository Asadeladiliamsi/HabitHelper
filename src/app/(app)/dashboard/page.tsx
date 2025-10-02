'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardClient } from '@/components/dashboard-client';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import { SiswaDashboardClient } from '@/components/siswa-dashboard-client';
import { AdminDashboardClient } from '@/components/admin-dashboard-client';
import { OrangTuaDashboardClient } from '@/components/orang-tua-dashboard-client';

export default function DashboardPage() {
  const { userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !userProfile) {
      router.replace('/login');
    }
  }, [loading, userProfile, router]);


  if (loading || !userProfile) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (userProfile.role === 'guru') {
    return <DashboardClient />;
  }

  if (userProfile.role === 'admin') {
    return <AdminDashboardClient />;
  }
  
  if (userProfile.role === 'orangtua') {
    return <OrangTuaDashboardClient />;
  }

  if (userProfile.role === 'siswa') {
    return <SiswaDashboardClient />;
  }
  
  // Fallback loading or empty state
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}
