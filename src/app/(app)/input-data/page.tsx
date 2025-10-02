'use client';

import { DataInputClient } from '@/components/data-input-client';
import { useAuth } from '@/contexts/auth-context';
import { useStudent } from '@/contexts/student-context';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function InputDataPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { students, loading: studentLoading } = useStudent();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not a student or still loading
    if (!authLoading && userProfile?.role !== 'siswa') {
      router.replace('/dashboard');
    }
  }, [userProfile, authLoading, router]);
  
  const studentData = students.find(s => s.linkedUserUid === user?.uid);

  if (authLoading || studentLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (userProfile?.role !== 'siswa') {
    return null;
  }
  
  if (!studentData) {
      return (
        <div className="flex h-full w-full items-center justify-center">
            <p>Data siswa tidak ditemukan. Hubungi guru Anda.</p>
        </div>
      )
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
