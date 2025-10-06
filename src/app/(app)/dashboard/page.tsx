'use client';

import { Loader2 } from 'lucide-react';
import { DashboardClient } from '@/components/dashboard-client';
import { SiswaDashboardClient } from '@/components/siswa-dashboard-client';
import { OrangTuaDashboardClient } from '@/components/orang-tua-dashboard-client';
import { useAuth } from '@/firebase/provider';
import { useRouter } from 'next/navigation';
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
        // The /loading page should prevent this, but as a safeguard
        router.replace('/login');
        return;
    }

    let unsubStudents: () => void = () => {};
    const role = userProfile.role;
    setDataLoading(true);

    if (role === 'siswa') {
      // The student document ID is the same as the user UID
      const studentDocRef = doc(db, 'students', userProfile.uid);
      unsubStudents = onSnapshot(studentDocRef, (doc) => {
        if (doc.exists()) {
          setStudentData({ id: doc.id, ...doc.data() } as Student);
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
    } else { // 'guru' or 'admin'
      setDataLoading(false);
    }
    
    return () => unsubStudents();

  }, [profileLoading, userProfile, router]);

  useEffect(() => {
    if (!userProfile) return;

    let studentIds: string[] = [];
    if (userProfile.role === 'siswa') {
        studentIds = [userProfile.uid];
    } else if (userProfile.role === 'orangtua') {
        studentIds = childStudents.map(s => s.id);
    }

    if (studentIds.length === 0) {
      if (userProfile.role === 'guru' || userProfile.role === 'admin' || !dataLoading) {
        setHabitEntries([]);
      }
      return;
    }
    
    const entriesQuery = query(collection(db, 'habit_entries'), where('studentId', 'in', studentIds));
    const unsubEntries = onSnapshot(entriesQuery, (snapshot) => {
        setHabitEntries(snapshot.docs.map(d => ({ ...d.data(), id: d.id, date: (d.data().date as Timestamp).toDate() } as HabitEntry)));
    });

    return () => unsubEntries();

  }, [userProfile, childStudents, dataLoading]);


  if (profileLoading || dataLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4 text-muted-foreground">Memuat data dasbor...</p>
      </div>
    );
  }

  // The /loading page handles the primary routing, this is a safeguard.
  if (!userProfile) {
     return (
        <div className="flex h-full w-full items-center justify-center">
            <p>Profil pengguna tidak ditemukan. Mengalihkan...</p>
        </div>
     );
  }

  // The check for class selection is now primarily on the /loading page.
  // This is a secondary check in case the user navigates here directly.
  if (userProfile.role === 'siswa' && studentData && !studentData.class) {
      router.replace('/pilih-kelas');
      return (
        <div className="flex h-full w-full items-center justify-center">
            <p>Anda belum memilih kelas. Mengalihkan...</p>
        </div>
      );
  }

  // Render the correct dashboard based on the role.
  switch (userProfile.role) {
    case 'guru':
      return <DashboardClient />;
    case 'admin':
      // The /loading page should have already redirected. This is a safeguard.
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
      // Should not happen, but as a fallback.
      router.replace('/login');
      return (
        <div className="flex h-full w-full items-center justify-center">
          <p>Peran pengguna tidak dikenali. Mengalihkan...</p>
        </div>
      );
  }
}
