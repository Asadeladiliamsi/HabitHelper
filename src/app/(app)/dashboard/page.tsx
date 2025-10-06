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
          const student = { id: doc.id, ...doc.data() } as Student;
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
    } else if (role === 'admin') {
      router.replace('/admin/dashboard');
      return; // Stop further execution
    }
    else { // 'guru'
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
     return null; // The useEffect above handles the redirect
  }

  // Render the correct dashboard based on the role.
  switch (userProfile.role) {
    case 'guru':
      return <DashboardClient />;
    case 'admin':
      return null; // The useEffect above handles the redirect
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
      router.replace('/login');
      return null; // Fallback redirect
  }
}
