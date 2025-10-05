'use client';

import { DataInputClient } from '@/components/data-input-client';
import { useAuth } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function InputDataPage() {
  const { userProfile, studentData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!userProfile || userProfile.role !== 'siswa') {
      router.replace('/dashboard');
      return;
    }
    
    if (studentData && !studentData.class) {
      router.replace('/pilih-kelas');
    }

  }, [userProfile, studentData, loading, router]);


  if (loading || !studentData) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
