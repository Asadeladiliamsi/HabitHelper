'use client';

import { Loader2 } from 'lucide-react';
import { DashboardClient } from '@/components/dashboard-client';
import { SiswaDashboardClient } from '@/components/siswa-dashboard-client';
import { OrangTuaDashboardClient } from '@/components/orang-tua-dashboard-client';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { UserProfile, Student, HabitEntry } from '@/lib/types';
import { doc, onSnapshot, query, collection, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [habitEntries, setHabitEntries] = useState<HabitEntry[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }

    setDataLoading(true);
    const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        const profile = doc.data() as UserProfile;
        setUserProfile(profile);

        if (profile.role === 'siswa') {
          const studentQuery = query(collection(db, 'students'), where('linkedUserUid', '==', user.uid));
          const unsubStudent = onSnapshot(studentQuery, (studentSnapshot) => {
            if (!studentSnapshot.empty) {
              const studentDoc = studentSnapshot.docs[0];
              const sData = { id: studentDoc.id, ...studentDoc.data() } as Student;
              setStudentData(sData);

              const entriesQuery = query(collection(db, 'habit_entries'), where('studentId', '==', sData.id));
              const unsubEntries = onSnapshot(entriesQuery, (entriesSnapshot) => {
                const entries = entriesSnapshot.docs.map(d => ({
                  ...d.data(),
                  id: d.id,
                  date: (d.data().date as Timestamp).toDate(),
                } as HabitEntry));
                setHabitEntries(entries);
                setDataLoading(false);
              });
              return () => unsubEntries();
            } else {
              setStudentData(null);
              setDataLoading(false);
               toast({
                variant: 'destructive',
                title: 'Data Siswa Tidak Ditemukan',
                description: 'Tidak dapat menemukan data siswa yang tertaut dengan akun Anda. Silakan hubungi admin.',
               });
               router.replace('/login');
            }
          });
          return () => unsubStudent();
        } else {
          setStudentData(null);
          setHabitEntries([]);
          setDataLoading(false);
        }
      } else {
        setUserProfile(null);
        setDataLoading(false);
        router.replace('/login');
      }
    });

    return () => unsubProfile();
  }, [user, authLoading, router, toast]);

  const loading = authLoading || dataLoading;

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
         <p className="ml-4 text-muted-foreground">Memuat data...</p>
      </div>
    );
  }

  if (!userProfile) {
     return null; // AppLayout will handle the redirect.
  }

  switch (userProfile.role) {
    case 'guru':
      return <DashboardClient />;
    case 'admin':
      router.replace('/admin/dashboard');
      return null;
    case 'orangtua':
      return <OrangTuaDashboardClient />;
    case 'siswa':
      if (studentData) {
        return <SiswaDashboardClient studentData={studentData} habitEntries={habitEntries} />;
      } else {
         return (
             <div className="flex h-full w-full items-center justify-center">
                 <Loader2 className="h-8 w-8 animate-spin" />
                 <p className="ml-2">Data siswa tidak ditemukan. Mengalihkan...</p>
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
