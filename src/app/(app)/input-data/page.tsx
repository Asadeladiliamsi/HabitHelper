'use client';

import { DataInputClient } from '@/components/data-input-client';
import { useAuth } from '@/firebase/provider';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function InputDataPage() {
  const { userProfile, studentData, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!userProfile || userProfile.role !== 'siswa') {
     router.replace('/dashboard');
     return (
        <div className="flex h-full w-full items-center justify-center">
          <p>Peran tidak valid. Mengalihkan...</p>
        </div>
     );
  }

  if (!studentData) {
     return (
      <div className="flex h-full w-full items-center justify-center">
        <p>Data siswa tidak ditemukan.</p>
      </div>
    );
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
