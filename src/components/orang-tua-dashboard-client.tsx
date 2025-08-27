'use client';

import { useAuth } from '@/contexts/auth-context';
import { useStudent } from '@/contexts/student-context';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';
import {
  Sunrise,
  BookOpen,
  HeartPulse,
  Utensils,
  HandHelping,
  Church,
  Bed
} from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Student } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const habitIcons: { [key: string]: React.ReactNode } = {
  'Bangun Pagi': <Sunrise className="h-5 w-5 text-yellow-500" />,
  'Taat Beribadah': <Church className="h-5 w-5 text-purple-500" />,
  'Rajin Olahraga': <HeartPulse className="h-5 w-5 text-red-500" />,
  'Makan Sehat & Bergizi': <Utensils className="h-5 w-5 text-green-500" />,
  'Gemar Belajar': <BookOpen className="h-5 w-5 text-blue-500" />,
  'Bermasyarakat': <HandHelping className="h-5 w-5 text-orange-500" />,
  'Tidur Cepat': <Bed className="h-5 w-5 text-indigo-500" />,
};

export function OrangTuaDashboardClient() {
  const { userProfile } = useAuth();
  const { students, loading: studentsLoading } = useStudent();
  const { language } = useLanguage();
  const t = translations[language]?.dashboardPage || translations.en.dashboardPage;
  const tHabits = translations[language]?.landingPage.habits || translations.en.landingPage.habits;

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Find all children linked to this parent
  const parentStudents = students.filter(s => s.parentId === userProfile?.uid);

  useEffect(() => {
    // Set the first child as selected by default
    if (parentStudents.length > 0 && !selectedStudentId) {
      setSelectedStudentId(parentStudents[0].id);
    }
  }, [parentStudents, selectedStudentId]);


  const habitTranslationMapping: Record<string, string> = {
    'Bangun Pagi': tHabits.bangunPagi.name,
    'Taat Beribadah': tHabits.taatBeribadah.name,
    'Rajin Olahraga': tHabits.rajinOlahraga.name,
    'Makan Sehat & Bergizi': tHabits.makanSehat.name,
    'Gemar Belajar': tHabits.gemarBelajar.name,
    'Bermasyarakat': tHabits.bermasyarakat.name,
    'Tidur Cepat': tHabits.tidurCepat.name,
  };

  if (studentsLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (parentStudents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Anak Belum Ditautkan</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Akun Anda belum ditautkan dengan data siswa manapun di sistem. Mohon hubungi pihak sekolah atau guru wali kelas untuk menautkan akun Anda ke data anak Anda.</p>
        </CardContent>
      </Card>
    );
  }
  
  const selectedStudentData = parentStudents.find(s => s.id === selectedStudentId);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Dasbor Perkembangan Anak</h1>
        <p className="text-muted-foreground">Selamat datang, {userProfile?.name}. Pantau progres anak Anda di sini.</p>
      </header>

      {parentStudents.length > 1 && (
        <Card>
            <CardHeader>
                <CardTitle>Pilih Anak</CardTitle>
                <CardDescription>Anda memiliki lebih dari satu anak terdaftar. Pilih anak yang ingin Anda lihat progresnya.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Select value={selectedStudentId || ''} onValueChange={setSelectedStudentId}>
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

      {selectedStudentData ? (
        <Card>
            <CardHeader>
            <CardTitle>Progres Kebiasaan {selectedStudentData.name}</CardTitle>
            <CardDescription>Berikut adalah rekapitulasi nilai dari 7 kebiasaan inti yang dijalani oleh {selectedStudentData.name}.</CardDescription>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Kebiasaan</TableHead>
                    <TableHead className="text-right">Nilai Terakhir</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {selectedStudentData.habits.map((habit) => (
                    <TableRow key={habit.id}>
                    <TableCell>
                        <div className="flex items-center gap-3">
                        {habitIcons[habit.name]}
                        <span className="font-medium">{habitTranslationMapping[habit.name] || habit.name}</span>
                        </div>
                    </TableCell>
                    <TableCell className="text-right">
                        <span className="font-mono text-lg font-bold">{habit.score}</span>
                    </TableCell>
                    </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-bold">
                    <TableCell>Rata-rata Keseluruhan</TableCell>
                    <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                            <Progress value={( (selectedStudentData.habits.reduce((acc, h) => acc + h.score, 0) / (selectedStudentData.habits.length || 1)) / 4) * 100} className="w-24 h-2" />
                            <span className="font-mono text-sm">{(selectedStudentData.habits.reduce((acc, h) => acc + h.score, 0) / (selectedStudentData.habits.length || 1)).toFixed(1)}</span>
                        </div>
                    </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            </CardContent>
        </Card>
      ) : (
         <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}
    </div>
  );
}
