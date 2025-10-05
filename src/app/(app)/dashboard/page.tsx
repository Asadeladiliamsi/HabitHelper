'use client';

import { Loader2 } from 'lucide-react';
import { DashboardClient } from '@/components/dashboard-client';
import { SiswaDashboardClient } from '@/components/siswa-dashboard-client';
import { OrangTuaDashboardClient } from '@/components/orang-tua-dashboard-client';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { userProfile, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // After loading, if there's no profile, redirect to login.
  // This handles the case where the user is not logged in.
  if (!userProfile) {
    router.replace('/login');
    return (
        <div className="flex h-full w-full items-center justify-center">
             <Loader2 className="h-8 w-8 animate-spin" />
             <p className="ml-2">Mengalihkan ke halaman login...</p>
        </div>
    );
  }

  switch (userProfile.role) {
    case 'guru':
      return <DashboardClient />;
    case 'admin':
      router.replace('/admin/dashboard');
      return null;
    case 'orangtua':
      return <OrangTuaDashboardClient />;
    case 'siswa':
      return <SiswaDashboardClient />;
    default:
       // Redirect to login if role is unknown
      router.replace('/login');
      return (
        <div className="flex h-full w-full items-center justify-center">
          <p>Peran pengguna tidak dikenali. Mengalihkan...</p>
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
  }
}
