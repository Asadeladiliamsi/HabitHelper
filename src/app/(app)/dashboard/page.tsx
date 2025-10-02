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
  const { students, loading: studentLoading } = useStudent();
  const router = useRouter();

  useEffect(() => {
    if (authLoading || studentLoading) return;

    if (!userProfile) {
      router.replace('/login');
      return;
    }
    
    if (userProfile.role === 'admin') {
      router.replace('/admin/dashboard');
    } else if (userProfile.role === 'orangtua') {
      router.replace('/orangtua/dashboard');
    } else if (userProfile.role === 'siswa') {
      const studentData = students.find(s => s.linkedUserUid === userProfile.uid);
      if (studentData && !studentData.class) {
        router.replace('/pilih-kelas');
      }
    }
  }, [authLoading, studentLoading, userProfile, students, router]);

  if (authLoading || studentLoading || !userProfile) {
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
    // While redirecting or if student data is not ready, show loader
    return (
       <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Fallback for roles that should be redirected (admin/parent/student-no-class)
  return (
    <div className="flex h-full w-full items-center justify-center">
      <p>Memuat dasbor Anda...</p>
      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
    </div>
  );
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
