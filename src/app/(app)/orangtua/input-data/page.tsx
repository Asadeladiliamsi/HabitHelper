'use client';

import { DataInputClient } from '@/components/data-input-client';
import { useUserProfile } from '@/hooks/use-user-profile';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Student } from '@/lib/types';


const PARENT_ALLOWED_HABITS = [
    'Taat Beribadah', 
    'Rajin Olahraga', 
    'Makan Sehat & Bergizi', 
    'Tidur Cepat'
];

export default function ParentInputDataPage() {
  const { userProfile, loading: authLoading } = useUserProfile();
  const [students, setStudents] = useState<Student[]>([]);
  const [studentLoading, setStudentLoading] = useState(true);
  const router = useRouter();
  
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  useEffect(() => {
    if (!authLoading && userProfile?.role !== 'orangtua') {
      router.replace('/dashboard');
    }
  }, [userProfile, authLoading, router]);

  useEffect(() => {
    if (userProfile && userProfile.role === 'orangtua') {
      setStudentLoading(true);
      const q = query(collection(db, 'students'), where('parentId', '==', userProfile.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const studentData: Student[] = [];
        querySnapshot.forEach((doc) => {
          studentData.push({ id: doc.id, ...doc.data() } as Student);
        });
        setStudents(studentData);
        if (studentData.length > 0 && !selectedStudentId) {
          setSelectedStudentId(studentData[0].id);
        }
        setStudentLoading(false);
      }, (error) => {
        console.error("Error fetching parent's students:", error);
        setStudentLoading(false);
      });
      return () => unsubscribe();
    } else {
      setStudentLoading(false);
    }
  }, [userProfile, selectedStudentId]);


  if (authLoading || studentLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (userProfile?.role !== 'orangtua') {
    return null; // Or a redirect
  }
  
  if (students.length === 0) {
      return (
        <Card>
            <CardHeader>
                <CardTitle>Data Anak Belum Ditautkan</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Akun Anda belum ditautkan dengan data siswa manapun di sistem. Mohon hubungi pihak sekolah untuk menautkan data anak Anda.</p>
            </CardContent>
      </Card>
      )
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          Input Data Harian Anak
        </h1>
        <p className="text-muted-foreground">
          Catat progres kebiasaan harian anak Anda di sini. Hanya kebiasaan tertentu yang bisa diisi oleh orang tua.
        </p>
      </header>

      {students.length > 1 && (
         <Card>
            <CardHeader>
                <CardTitle>Pilih Anak</CardTitle>
                <CardDescription>Anda memiliki lebih dari satu anak. Pilih anak yang datanya ingin Anda isi.</CardDescription>
            </CardHeader>
            <CardContent>
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                    <SelectTrigger className="w-full max-w-sm">
                        <SelectValue placeholder="Pilih nama anak..." />
                    </SelectTrigger>
                    <SelectContent>
                        {students.map(student => (
                            <SelectItem key={student.id} value={student.id}>
                                {student.name} - Kelas {student.class}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>
      )}

      {selectedStudentId ? (
         <DataInputClient 
            studentId={selectedStudentId} 
            allowedHabits={PARENT_ALLOWED_HABITS}
         />
      ) : (
         <div className="flex items-center justify-center h-48">
            <p className="text-muted-foreground">Silakan pilih anak untuk mulai mengisi data.</p>
         </div>
      )}
    </div>
  );
}
