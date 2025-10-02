'use client';

import { DataInputClient } from '@/components/data-input-client';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function InputDataPage() {
  const { userProfile, studentData, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect non-students
    if (!authLoading && userProfile?.role !== 'siswa') {
      router.replace('/dashboard');
    }
    // Redirect students who haven't chosen a class
    if (!authLoading && userProfile?.role === 'siswa' && studentData && !studentData.class) {
      router.replace('/pilih-kelas');
    }
  }, [userProfile, studentData, authLoading, router]);


  if (authLoading || !studentData) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // This check is redundant due to useEffect, but good for safety
  if (userProfile?.role !== 'siswa') {
    return null;
  }
  
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          Input Data Harian
        </h1>
        <p className="text-muted-foreground">
          Catat progres kebiasaan harianmu di sini.
        </p>
      </header>
      <DataInputClient studentId={studentData.id} />
    </div>
  );
}
