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
    // Tunggu hingga semua proses loading selesai
    if (authLoading || studentLoading) {
      return;
    }

    // Jika tidak ada profil pengguna, arahkan ke login
    if (!userProfile) {
      router.replace('/login');
      return;
    }
    
    // Logika pengalihan berdasarkan peran
    if (userProfile.role === 'admin') {
      router.replace('/admin/dashboard');
    } else if (userProfile.role === 'orangtua') {
      router.replace('/orangtua/dashboard');
    } else if (userProfile.role === 'siswa') {
      const studentData = students.find(s => s.linkedUserUid === userProfile.uid);
      // Jika data siswa ditemukan tapi belum ada kelas, arahkan ke halaman pilih kelas.
      if (studentData && !studentData.class) {
        router.replace('/pilih-kelas');
      }
    }
  }, [authLoading, studentLoading, userProfile, students, router]);

  // Tampilkan loader jika ada proses yang masih berjalan atau belum ada profil pengguna
  if (authLoading || studentLoading || !userProfile) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  // Render dasbor yang sesuai berdasarkan peran pengguna
  if (userProfile.role === 'guru') {
    return <DashboardClient />;
  }
  
  if (userProfile.role === 'siswa') {
    const studentData = students.find(s => s.linkedUserUid === userProfile.uid);
    // Tampilkan dasbor siswa hanya jika data siswa ada dan sudah memiliki kelas
    if (studentData && studentData.class) {
      return <SiswaDashboardClient />;
    }
    // Jika data siswa belum ada atau belum ada kelas, tampilkan loader selagi di-redirect
    return (
       <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Fallback untuk peran lain (admin/orangtua/siswa tanpa kelas) selagi dialihkan
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
