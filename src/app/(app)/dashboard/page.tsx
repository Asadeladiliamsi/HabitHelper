'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardClient } from '@/components/dashboard-client';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import { useStudent } from '@/contexts/student-context';
import { SiswaDashboardClient } from '@/components/siswa-dashboard-client';

export default function DashboardPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const { students, loading: studentLoading } = useStudent();
  const router = useRouter();

  const isLoading = authLoading || studentLoading;

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!userProfile) {
      router.replace('/login');
      return;
    }

    if (userProfile.role === 'admin') {
      router.replace('/admin/dashboard');
      return;
    }

    if (userProfile.role === 'orangtua') {
      router.replace('/orangtua/dashboard');
      return;
    }
    
    if (userProfile.role === 'siswa') {
      const studentData = students.find(s => s.linkedUserUid === userProfile.uid);
      if (studentData && !studentData.class) {
        router.replace('/pilih-kelas');
        return;
      }
    }
  }, [isLoading, userProfile, students, router]);


  if (isLoading || !userProfile) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (userProfile.role === 'guru') {
    return <DashboardClient />;
  }

  if (userProfile.role === 'siswa') {
    const studentData = students.find(s => s.linkedUserUid === userProfile.uid);
    if (studentData && studentData.class) {
       return <SiswaDashboardClient />;
    }
  }
  
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}
