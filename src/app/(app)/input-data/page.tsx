'use client';

import { DataInputClient } from '@/components/data-input-client';
import { useAuth } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Student, UserProfile } from '@/lib/types';


export default function InputDataPage() {
  const { user, loading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }

    const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        const profile = doc.data() as UserProfile;
        setUserProfile(profile);
        if (profile.role !== 'siswa') {
          router.replace('/dashboard');
        }
      } else {
        router.replace('/login');
      }
    });

    return () => unsubProfile();
  }, [user, authLoading, router]);

  useEffect(() => {
    if (userProfile?.role === 'siswa') {
      const q = query(collection(db, 'students'), where('linkedUserUid', '==', userProfile.uid));
      const unsubStudent = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const studentDoc = snapshot.docs[0];
          const sData = { id: studentDoc.id, ...studentDoc.data() } as Student;
          setStudentData(sData);
          if (!sData.class) {
            router.replace('/pilih-kelas');
          }
        } else {
          setStudentData(null);
        }
        setDataLoading(false);
      });
      return () => unsubStudent();
    } else {
      setDataLoading(false);
    }
  }, [userProfile, router]);


  if (authLoading || dataLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (userProfile?.role !== 'siswa' || !studentData) {
     return (
      <div className="flex h-full w-full items-center justify-center">
        <p>Data siswa tidak ditemukan atau peran tidak valid.</p>
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
