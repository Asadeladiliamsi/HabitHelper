'use client';

import { DataInputClient } from '@/components/data-input-client';
import { useAuth } from '@/firebase/provider';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Student } from '@/lib/types';


export default function InputDataPage() {
  const { userProfile, loading: profileLoading } = useAuth();
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [studentLoading, setStudentLoading] = useState(true);
  const router = useRouter();

   useEffect(() => {
    if (profileLoading) return;
    if (!userProfile) {
      router.replace('/login');
      return;
    }
    
    if (userProfile.role !== 'siswa') {
       router.replace('/dashboard');
       return;
    }

    const q = query(collection(db, 'students'), where('linkedUserUid', '==', userProfile.uid));
    const unsub = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const studentDoc = snapshot.docs[0];
          setStudentData({ id: studentDoc.id, ...studentDoc.data() } as Student);
        } else {
          setStudentData(null);
        }
        setStudentLoading(false);
      });

    return () => unsub();
  }, [profileLoading, userProfile, router]);


  const loading = profileLoading || studentLoading;

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!userProfile) {
     router.replace('/login');
     return (
        <div className="flex h-full w-full items-center justify-center">
          <p>Profil tidak ditemukan. Mengalihkan...</p>
        </div>
     );
  }
  
  if (userProfile.role !== 'siswa') {
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
