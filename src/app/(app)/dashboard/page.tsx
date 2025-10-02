'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardClient } from '@/components/dashboard-client';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import { StudentProvider, useStudent } from '@/contexts/student-context';
import { SiswaDashboardClient } from '@/components/siswa-dashboard-client';

function DashboardContent() {
  const { userProfile, loading: authLoading } = useAuth();
  const { loading: studentLoading } = useStudent();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !userProfile) {
      router.replace('/login');
    }
  }, [authLoading, userProfile, router]);

  const isLoading = authLoading || studentLoading;

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
    return <SiswaDashboardRouter />;
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      <p>Peran pengguna tidak dikenali. Mengalihkan...</p>
    </div>
  );
}

function SiswaDashboardRouter() {
    const { userProfile } = useAuth();
    const { students, loading: studentLoading } = useStudent();
    const router = useRouter();

    const studentData = userProfile ? students.find(s => s.linkedUserUid === userProfile.uid) : undefined;

    useEffect(() => {
        if (!studentLoading && studentData && !studentData.class) {
            router.replace('/pilih-kelas');
        }
    }, [studentLoading, studentData, router]);

    if (studentLoading) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (studentData?.class) {
        return <SiswaDashboardClient />;
    }
    
    // While redirecting or if data is not ready
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
}


export default function DashboardPage() {
  return (
    <StudentProvider>
      <div className="flex flex-col gap-6">
        <DashboardContent />
      </div>
    </StudentProvider>
  );
}
