'use client';

import { DataInputClient } from '@/components/data-input-client';
import { useUserProfile } from '@/hooks/use-user-profile';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Student } from '@/lib/types';


export default function InputDataPage() {
  const { user, userProfile, loading: authLoading } = useUserProfile();
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [studentLoading, setStudentLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (userProfile?.role !== 'siswa') {
      router.replace('/dashboard');
      return;
    }
    
    if (!user) {
        router.replace('/login');
        return;
    }

    const studentDocRef = doc(db, 'students', user.uid);
    const unsubscribe = onSnapshot(studentDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data() as Omit<Student, 'id'>;
            const currentStudentData = { id: docSnap.id, ...data };
            setStudentData(currentStudentData);
            if (!currentStudentData.class) {
                router.replace('/pilih-kelas');
            }
        } else {
             // This can happen if the student record is not yet created by an admin.
             setStudentData(null);
        }
        setStudentLoading(false);
    }, (error) => {
        console.error("Error fetching student data:", error);
        setStudentLoading(false);
    });

    return () => unsubscribe();

  }, [user, userProfile, authLoading, router]);


  if (authLoading || studentLoading || !studentData) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // This check is redundant due to useEffect, but good for safety
  if (userProfile?.role !== 'siswa' || !studentData) {
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
