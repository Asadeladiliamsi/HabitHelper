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
    if (isLoading) return;

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
      // Jika data siswa ada tapi belum ada kelas, paksa ke halaman pilih kelas
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

  // Tampilkan konten berdasarkan peran setelah semua pemeriksaan selesai
  if (userProfile.role === 'guru') {
    return <DashboardClient />;
  }

  if (userProfile.role === 'siswa') {
    const studentData = students.find(s => s.linkedUserUid === userProfile.uid);
    // Pastikan data siswa ada dan sudah punya kelas sebelum render dasbor siswa
    if (studentData && studentData.class) {
       return <SiswaDashboardClient />;
    }
  }
  
  // Tampilkan loader sebagai fallback selama proses pengalihan untuk menghindari kedipan layar
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}

function DashboardPageContent() {
    return (
        <StudentProvider>
            <div className="flex flex-col gap-6">
                <DashboardRouter />
            </div>
        </StudentProvider>
    );
}

export default function DashboardPage() {
  const { userProfile, loading } = useAuth();

  if (loading || !userProfile) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <DashboardPageContent />;
}
