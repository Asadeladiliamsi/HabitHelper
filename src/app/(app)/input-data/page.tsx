'use client';

import { DataInputClient } from '@/components/data-input-client';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Student } from '@/lib/types';

export default function InputDataPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [studentLoading, setStudentLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && userProfile?.role !== 'siswa') {
      router.replace('/dashboard');
    }
  }, [userProfile, authLoading, router]);
  
  useEffect(() => {
    if (user && userProfile?.role === 'siswa') {
      setStudentLoading(true);
      const q = query(collection(db, 'students'), where('linkedUserUid', '==', user.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          setStudentData({ id: doc.id, ...doc.data() } as Student);
        } else {
          setStudentData(null);
        }
        setStudentLoading(false);
      }, (error) => {
        console.error("Failed to fetch student data:", error);
        setStudentLoading(false);
      });
      return () => unsubscribe();
    } else {
      setStudentLoading(false);
    }
  }, [user, userProfile]);

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
