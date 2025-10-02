'use client';

import { DataInputClient } from '@/components/data-input-client';
import { useAuth } from '@/contexts/auth-context';
import { useStudent } from '@/contexts/student-context';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const PARENT_ALLOWED_HABITS = [
    'Taat Beribadah', 
    'Rajin Olahraga', 
    'Makan Sehat & Bergizi', 
    'Tidur Cepat'
];

export default function ParentInputDataPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const { students, loading: studentLoading } = useStudent();
  const router = useRouter();
  
  const parentStudents = students.filter(s => s.parentId === userProfile?.uid);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  useEffect(() => {
    // Redirect if not a parent or still loading
    if (!authLoading && userProfile?.role !== 'orangtua') {
      router.replace('/dashboard');
    }
  }, [userProfile, authLoading, router]);

   useEffect(() => {
    // Auto-select first child if only one, or if none is selected yet
    if (parentStudents.length > 0 && !selectedStudentId) {
      setSelectedStudentId(parentStudents[0].id);
    }
  }, [parentStudents, selectedStudentId]);


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
  
  if (parentStudents.length === 0) {
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

      {parentStudents.length > 1 && (
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
