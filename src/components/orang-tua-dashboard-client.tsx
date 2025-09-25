
'use client';

import { useAuth } from '@/contexts/auth-context';
import { useStudent } from '@/contexts/student-context';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

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

  const calculateOverallAverage = (student: Student) => {
    if (!student.habits || student.habits.length === 0) return 0;
    const totalScore = student.habits.reduce((acc, h) => {
      if (!h.subHabits || h.subHabits.length === 0) return acc;
      const subHabitTotal = h.subHabits.reduce((subAcc, sh) => subAcc + sh.score, 0);
      const subHabitAverage = subHabitTotal / h.subHabits.length;
      return acc + subHabitAverage;
    }, 0);
    return totalScore / student.habits.length;
  };

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
            <CardDescription>Klik setiap kebiasaan untuk melihat rincian aspek yang dinilai.</CardDescription>
            </CardHeader>
            <CardContent>
            {selectedStudentData.habits ? (
              <div className="space-y-4">
                <Accordion type="multiple" className="w-full">
                  {selectedStudentData.habits.map((habit) => {
                      const habitAverage = (!habit.subHabits || habit.subHabits.length === 0) 
                          ? 0 
                          : habit.subHabits.reduce((acc, sub) => acc + sub.score, 0) / (habit.subHabits.length || 1);

                      return (
                          <AccordionItem value={habit.id} key={habit.id}>
                              <AccordionTrigger className="hover:no-underline">
                                  <div className="flex items-center gap-3 w-full">
                                      {habitIcons[habit.name]}
                                      <span className="font-medium flex-1 text-left">{habitTranslationMapping[habit.name] || habit.name}</span>
                                      <div className="flex items-center gap-2 pr-2">
                                          <Progress value={(habitAverage / 4) * 100} className="w-24 h-2" />
                                          <span className="font-mono text-lg font-bold">{habitAverage.toFixed(1)}</span>
                                      </div>
                                  </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                  <div className="pl-8 pr-4 space-y-3">
                                      {habit.subHabits && habit.subHabits.length > 0 ? (
                                          habit.subHabits.map(subHabit => (
                                              <div key={subHabit.id} className="flex items-center justify-between text-sm">
                                                  <p className="text-muted-foreground flex-1 pr-4">{subHabit.name}</p>
                                                  <div className="flex items-center gap-2 w-28">
                                                      <Progress value={(subHabit.score / 4) * 100} className="w-16 h-1.5" />
                                                      <span className="font-mono text-sm font-semibold">{subHabit.score}</span>
                                                  </div>
                                              </div>
                                          ))
                                      ) : (
                                          <p className="text-sm text-muted-foreground">Tidak ada aspek yang tercatat untuk kebiasaan ini.</p>
                                      )}
                                  </div>
                              </AccordionContent>
                          </AccordionItem>
                      )
                  })}
              </Accordion>
              
              <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg font-bold">
                  <span>Rata-rata Keseluruhan</span>
                  <div className="flex items-center justify-end gap-2">
                      <Progress value={(calculateOverallAverage(selectedStudentData) / 4) * 100} className="w-24 h-2" />
                      <span className="font-mono text-sm">{ calculateOverallAverage(selectedStudentData).toFixed(1) }</span>
                  </div>
              </div>
            </div>
            ) : (
              <p className="text-muted-foreground text-center">Data kebiasaan untuk siswa ini belum ada.</p>
            )}
            </CardContent>
        </Card>
      ) : (
         <div className="flex h-48 items-center justify-center">
            <p className="text-muted-foreground">Silakan pilih anak untuk melihat progres.</p>
        </div>
      )}
    </div>
  );
}

    