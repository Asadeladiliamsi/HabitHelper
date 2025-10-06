'use client';

import { Loader2 } from 'lucide-react';
import { DashboardClient } from '@/components/dashboard-client';
import { SiswaDashboardClient } from '@/components/siswa-dashboard-client';
import { OrangTuaDashboardClient } from '@/components/orang-tua-dashboard-client';
import { AdminDashboardClient } from '@/components/admin-dashboard-client';
import { useAuth } from '@/firebase/provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
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
        // This case is handled by the layout redirect, but as a safeguard.
        router.replace('/login');
        return;
    }

    let unsubStudents: () => void = () => {};
    const role = userProfile.role;
    setDataLoading(true);

    if (role === 'siswa') {
      const q = query(collection(db, 'students'), where('linkedUserUid', '==', userProfile.uid));
      unsubStudents = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const student = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Student;
          setStudentData(student);
          // If student has not selected a class, redirect them.
          if (!student.class) {
            router.replace('/pilih-kelas');
          }
        } else {
          setStudentData(null);
          // This state is unlikely but possible if student doc creation failed.
          // Redirecting to class selection might allow recreation or shows an error.
          router.replace('/pilih-kelas');
        }
        setDataLoading(false);
      });
    } else if (role === 'orangtua') {
       const q = query(collection(db, 'students'), where('parentId', '==', userProfile.uid));
       unsubStudents = onSnapshot(q, (snapshot) => {
         setChildStudents(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Student)));
         setDataLoading(false);
       });
    }
    else { // 'guru' or 'admin'
      setDataLoading(false);
    }
    
    return () => unsubStudents();

  }, [profileLoading, userProfile, router]);

  useEffect(() => {
    if (!userProfile) return;

    let studentIds: string[] = [];
    if (userProfile.role === 'siswa' && studentData) {
        studentIds = [studentData.id];
    } else if (userProfile.role === 'orangtua') {
        studentIds = childStudents.map(s => s.id);
    }

    if (studentIds.length === 0) {
      // For teachers and admins, entries are loaded inside DashboardClient.
      // For others, if there are no student IDs, we can stop here.
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

  }, [userProfile, studentData, childStudents, dataLoading]);


  if (profileLoading || dataLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4 text-muted-foreground">Memuat data dasbor...</p>
      </div>
    );
  }

  if (!userProfile) {
     return null; // The layout's useEffect handles the redirect
  }

  // Render the correct dashboard based on the role.
  switch (userProfile.role) {
    case 'guru':
      return <DashboardClient />;
    case 'admin':
      return <AdminDashboardClient />;
    case 'orangtua':
      return <OrangTuaDashboardClient userProfile={userProfile} childStudents={childStudents} habitEntries={habitEntries} />;
    case 'siswa':
      if (studentData?.class) { // Only render if student has a class
        return <SiswaDashboardClient studentData={studentData} habitEntries={habitEntries} />;
      } else {
         // This state should be brief as the useEffect redirects to /pilih-kelas
         return (
             <div className="flex h-full w-full flex-col items-center justify-center gap-4">
                 <Loader2 className="h-8 w-8 animate-spin" />
                 <p className="text-muted-foreground">Anda belum memilih kelas. Mengalihkan...</p>
             </div>
         );
      }
    default:
      // Fallback redirect for any unknown roles or states
      router.replace('/login');
      return null;
  }
}
