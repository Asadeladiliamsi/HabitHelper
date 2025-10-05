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

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [habitEntries, setHabitEntries] = useState<HabitEntry[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const router = useRouter();

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
          // Jika role adalah siswa, cari data siswa yang tertaut
          const studentQuery = query(collection(db, 'students'), where('linkedUserUid', '==', user.uid));
          const unsubStudent = onSnapshot(studentQuery, (studentSnapshot) => {
            if (!studentSnapshot.empty) {
              const studentDoc = studentSnapshot.docs[0];
              const sData = { id: studentDoc.id, ...studentDoc.data() } as Student;
              setStudentData(sData);

              // Ambil juga habit entries untuk siswa ini
              const entriesQuery = query(collection(db, 'habit_entries'), where('studentId', '==', sData.id));
              const unsubEntries = onSnapshot(entriesQuery, (entriesSnapshot) => {
                const entries = entriesSnapshot.docs.map(d => ({
                  ...d.data(),
                  id: d.id,
                  date: (d.data().date as Timestamp).toDate(),
                } as HabitEntry));
                setHabitEntries(entries);
                setDataLoading(false); // Semua data siswa sudah siap
              });
              
              // Return a function to unsubscribe from entries when student changes
              return () => unsubEntries();
            } else {
              setStudentData(null);
              // Siswa sudah punya profil tapi belum tertaut. Arahkan ke halaman penautan.
              router.replace('/link-account');
            }
          });
          // Return a function to unsubscribe from student data when profile changes
          return () => unsubStudent();
        } else {
          // Untuk role lain, kita anggap data siap setelah profil didapat
          setStudentData(null);
          setHabitEntries([]);
          setDataLoading(false);
        }
      } else {
        // Profil tidak ditemukan
        setUserProfile(null);
        setDataLoading(false);
        router.replace('/login');
      }
    });

    return () => unsubProfile();
  }, [user, authLoading, router]);

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
     router.replace('/login');
     return (
         <div className="flex h-full w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="ml-2">Profil tidak ditemukan. Mengalihkan ke halaman login...</p>
         </div>
     );
  }
  
  if (userProfile.role === 'siswa' && studentData && !studentData.class) {
      router.replace('/pilih-kelas');
      return (
         <div className="flex h-full w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="ml-2">Anda belum memilih kelas. Mengalihkan...</p>
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
      return <OrangTuaDashboardClient />;
    case 'siswa':
      if (studentData) {
        return <SiswaDashboardClient studentData={studentData} habitEntries={habitEntries} />;
      } else {
         return (
             <div className="flex h-full w-full items-center justify-center">
                 <Loader2 className="h-8 w-8 animate-spin" />
                 <p className="ml-2">Mengarahkan ke halaman penautan akun...</p>
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
