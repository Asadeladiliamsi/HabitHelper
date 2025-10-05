'use client';

import { Loader2 } from 'lucide-react';
import { DashboardClient } from '@/components/dashboard-client';
import { SiswaDashboardClient } from '@/components/siswa-dashboard-client';
import { OrangTuaDashboardClient } from '@/components/orang-tua-dashboard-client';
import { useAuth } from '@/firebase/provider';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Student, HabitEntry } from '@/lib/types';


export default function DashboardPage() {
  const { userProfile, loading: profileLoading } = useAuth();
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [childStudents, setChildStudents] = useState<Student[]>([]);
  const [habitEntries, setHabitEntries] = useState<HabitEntry[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (profileLoading) return;
    if (!userProfile) {
        // If profile is still loading or not found, data loading is not yet complete.
        setDataLoading(true);
        return;
    }

    let unsubStudents: () => void = () => {};
    const role = userProfile.role;

    if (role === 'siswa') {
      const q = query(collection(db, 'students'), where('linkedUserUid', '==', userProfile.uid));
      unsubStudents = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const studentDoc = snapshot.docs[0];
          setStudentData({ id: studentDoc.id, ...studentDoc.data() } as Student);
        } else {
          setStudentData(null);
        }
        setDataLoading(false);
      });
    } else if (role === 'orangtua') {
       const q = query(collection(db, 'students'), where('parentId', '==', userProfile.uid));
       unsubStudents = onSnapshot(q, (snapshot) => {
         setChildStudents(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Student)));
         setDataLoading(false);
       });
    } else if (role === 'guru' || role === 'admin') {
      setDataLoading(false); // Guru/Admin data is handled in their specific components
    } else {
      setDataLoading(false);
    }
    
    return () => unsubStudents();

  }, [profileLoading, userProfile]);

  useEffect(() => {
    let studentIds: string[] = [];
    if (studentData) { // For 'siswa'
        studentIds = [studentData.id];
    } else if (childStudents.length > 0) { // For 'orangtua'
        studentIds = childStudents.map(s => s.id);
    }
    
    if (studentIds.length === 0) {
        if (!dataLoading) setHabitEntries([]);
        return;
    }

    const q = query(collection(db, 'habit_entries'), where('studentId', 'in', studentIds));
    const unsubEntries = onSnapshot(q, (snapshot) => {
        setHabitEntries(snapshot.docs.map(d => ({ ...d.data(), id: d.id, date: (d.data().date as Timestamp).toDate() } as HabitEntry)));
    });

    return () => unsubEntries();

  }, [studentData, childStudents, dataLoading]);


  if (profileLoading || dataLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4 text-muted-foreground">Memuat data...</p>
      </div>
    );
  }

  if (!userProfile) {
     // This case is handled by the AppLayout, but as a fallback:
     router.replace('/login');
     return (
        <div className="flex h-full w-full items-center justify-center">
            <p>Profil pengguna tidak ditemukan. Mengalihkan...</p>
        </div>
     );
  }

  switch (userProfile.role) {
    case 'guru':
      return <DashboardClient />;
    case 'admin':
      router.replace('/admin/dashboard');
      return null;
    case 'orangtua':
      return <OrangTuaDashboardClient userProfile={userProfile} childStudents={childStudents} habitEntries={habitEntries} />;
    case 'siswa':
      if (studentData) {
        return <SiswaDashboardClient studentData={studentData} habitEntries={habitEntries} />;
      } else {
         return (
             <div className="flex h-full w-full flex-col items-center justify-center gap-4">
                 <p className='text-destructive font-semibold'>Gagal Memuat Data Siswa</p>
                 <p className="text-sm text-muted-foreground">Data siswa yang tertaut dengan akun Anda tidak dapat ditemukan.</p>
                 <p className="text-sm text-muted-foreground">Mohon hubungi administrator sekolah.</p>
             </div>
         );
      }
    default:
      router.replace('/login');
      return (
        <div className="flex h-full w-full items-center justify-center">
          <p>Peran pengguna tidak dikenali. Mengalihkan...</p>
        </div>
      );
  }
}
