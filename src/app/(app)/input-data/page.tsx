'use client';

import { DataInputClient } from '@/components/data-input-client';
import { ManageStudentsClient } from '@/components/manage-students-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { translations } from '@/lib/translations';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase/provider';
import { ManageClassesClient } from '@/components/manage-classes-client';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Student, UserProfile } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PARENT_ALLOWED_HABITS = [
    'Taat Beribadah', 
    'Rajin Olahraga', 
    'Makan Sehat & Bergizi', 
    'Tidur Cepat'
];

export default function InputDataPage() {
  const { userProfile, loading } = useAuth();
  const router = useRouter();

  // State specific to the parent role
  const [parentStudents, setParentStudents] = useState<Student[]>([]);
  const [parentStudentLoading, setParentStudentLoading] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState<string>('');

  // Effect for fetching children of a parent
  useEffect(() => {
    if (userProfile?.role === 'orangtua' && userProfile.uid) {
      setParentStudentLoading(true);
      const q = query(collection(db, 'students'), where('parentId', '==', userProfile.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const studentData: Student[] = [];
        querySnapshot.forEach((doc) => {
          studentData.push({ id: doc.id, ...doc.data() } as Student);
        });
        setParentStudents(studentData);
        if (studentData.length > 0 && !selectedChildId) {
          setSelectedChildId(studentData[0].id);
        }
        setParentStudentLoading(false);
      }, (error) => {
        console.error("Error fetching parent's students:", error);
        setParentStudentLoading(false);
      });
      return () => unsubscribe();
    } else {
      setParentStudentLoading(false);
    }
  }, [userProfile, selectedChildId]);
  
  if (loading) {
    return (
       <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-muted-foreground ml-2">Memuat data pengguna...</p>
      </div>
    );
  }

  // Redirect if not a valid role for this page
  if (!userProfile || !['guru', 'admin', 'siswa', 'orangtua'].includes(userProfile.role)) {
    router.replace('/dashboard');
    return null;
  }
  
  const language = 'id';
  const t = translations[language] || translations.en;

  const renderContentForRole = () => {
    switch(userProfile.role) {
      case 'guru':
      case 'admin':
        return (
          <>
            <Card>
                <CardHeader>
                    <CardTitle>Panduan Penilaian Skor</CardTitle>
                    <CardDescription>Gunakan panduan ini untuk memberikan skor yang konsisten.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><strong className="text-foreground">4 (Sangat Memadai):</strong> Siswa memenuhi semua kriteria secara mandiri dan konsisten.</li>
                        <li><strong className="text-foreground">3 (Memadai):</strong> Siswa memenuhi sebagian besar kriteria dengan sedikit bimbingan.</li>
                        <li><strong className="text-foreground">2 (Tidak Memadai):</strong> Siswa memenuhi sebagian kecil kriteria atau membutuhkan bimbingan.</li>
                        <li><strong className="text-foreground">1 (Sangat Tidak Memadai):</strong> Siswa tidak memenuhi kriteria atau memerlukan banyak bimbingan.</li>
                    </ul>
                </CardContent>
            </Card>
            <DataInputClient />
            <Separator />
            <ManageStudentsClient />
            <Separator />
            <ManageClassesClient />
          </>
        );
      case 'siswa':
        // Student's document ID is their UID
        return <DataInputClient studentId={userProfile.uid} />;
      case 'orangtua':
        if (parentStudentLoading) {
            return (
              <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-muted-foreground ml-2">Memuat data anak...</p>
              </div>
            );
        }
        if (parentStudents.length === 0) {
            return (
                <Card>
                    <CardHeader><CardTitle>Data Anak Belum Ditautkan</CardTitle></CardHeader>
                    <CardContent><p>Akun Anda belum ditautkan dengan data siswa manapun. Mohon hubungi pihak sekolah.</p></CardContent>
                </Card>
            )
        }
        return (
            <>
                {parentStudents.length > 1 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Pilih Anak</CardTitle>
                            <CardDescription>Anda memiliki lebih dari satu anak. Pilih anak yang datanya ingin Anda isi.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                                <SelectTrigger className="w-full max-w-sm">
                                    <SelectValue placeholder="Pilih nama anak..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {parentStudents.map(student => (
                                        <SelectItem key={student.id} value={student.id}>
                                            {student.name} - Kelas {student.class}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                )}
                {selectedChildId ? (
                    <DataInputClient 
                        studentId={selectedChildId} 
                        allowedHabits={PARENT_ALLOWED_HABITS}
                    />
                ) : (
                    <div className="flex items-center justify-center h-48"><p className="text-muted-foreground">Silakan pilih anak untuk mulai mengisi data.</p></div>
                )}
            </>
        );
      default:
        return <p>Peran pengguna tidak dikenali.</p>;
    }
  }

  const roleTitles: Record<string, string> = {
    guru: 'Input Data & Manajemen',
    admin: 'Input Data & Manajemen',
    siswa: 'Input Data Harian',
    orangtua: 'Input Data Harian Anak'
  }
  
  const roleDescriptions: Record<string, string> = {
    guru: 'Kelola semua data master terkait siswa dan kelas dari satu tempat.',
    admin: 'Kelola semua data master terkait siswa dan kelas dari satu tempat.',
    siswa: 'Catat progres kebiasaan harianmu di sini.',
    orangtua: 'Catat progres kebiasaan harian anak Anda di sini. Hanya kebiasaan tertentu yang bisa diisi oleh orang tua.'
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          {roleTitles[userProfile.role] || 'Input Data'}
        </h1>
        <p className="text-muted-foreground">
          {roleDescriptions[userProfile.role] || 'Kelola data Anda.'}
        </p>
      </header>
      
      <div className="space-y-8">
         {renderContentForRole()}
      </div>

    </div>
  );
}
