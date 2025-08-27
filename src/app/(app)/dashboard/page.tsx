'use client';

import { DashboardClient } from '@/components/dashboard-client';
import { SiswaDashboardClient } from '@/components/siswa-dashboard-client';
import { StudentProvider } from '@/contexts/student-context';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { userProfile, loading } = useAuth();

  if (loading) {
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
