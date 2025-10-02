'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardClient } from '@/components/dashboard-client';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import { StudentProvider, useStudent } from '@/contexts/student-context';
import { SiswaDashboardClient } from '@/components/siswa-dashboard-client';

function DashboardRouter() {
  const { userProfile, loading: authLoading } = useAuth();
  const { students, loading: studentLoading } = useStudent();
  const router = useRouter();

  const isLoading = authLoading || studentLoading;

  useEffect(() => {
    if (!isLoading && !userProfile) {
      router.replace('/login');
    }
  }, [isLoading, userProfile, router]);


  if (isLoading || !userProfile) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Redirect based on role after loading is complete
  if (userProfile.role === 'admin') {
    router.replace('/admin/dashboard');
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (userProfile.role === 'orangtua') {
    router.replace('/orangtua/dashboard');
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (userProfile.role === 'guru') {
    return <DashboardClient />;
  }

  if (userProfile.role === 'siswa') {
    const studentData = students.find(s => s.linkedUserUid === userProfile.uid);
    if (studentData && !studentData.class) {
      router.replace('/pilih-kelas');
       return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
    return <SiswaDashboardClient />;
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      <p>Peran pengguna tidak dikenali. Mengalihkan...</p>
    </div>
  );
}


export default function DashboardPage() {
  return (
    <StudentProvider>
      <div className="flex flex-col gap-6">
        <DashboardRouter />
      </div>
    </StudentProvider>
  );
}
