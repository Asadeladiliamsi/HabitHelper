
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
import type { Habit } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const habitIcons: { [key: string]: React.ReactNode } = {
  'Bangun Pagi': <Sunrise className="h-5 w-5 text-yellow-500" />,
  'Taat Beribadah': <Church className="h-5 w-5 text-purple-500" />,
  'Rajin Olahraga': <HeartPulse className="h-5 w-5 text-red-500" />,
  'Makan Sehat & Bergizi': <Utensils className="h-5 w-5 text-green-500" />,
  'Gemar Belajar': <BookOpen className="h-5 w-5 text-blue-500" />,
  'Bermasyarakat': <HandHelping className="h-5 w-5 text-orange-500" />,
  'Tidur Cepat': <Bed className="h-5 w-5 text-indigo-500" />,
};


export function SiswaDashboardClient() {
  const { user } = useAuth();
  const { students, loading: studentsLoading } = useStudent();
  const { language } = useLanguage();
  const t = translations[language]?.dashboardPage || translations.en.dashboardPage;
  const tHabits = translations[language]?.landingPage.habits || translations.en.landingPage.habits;

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

  // Find student data based on the logged-in user's email.
  const studentData = students.find(s => s.email === user?.email);

  if (!studentData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Siswa Belum Ditemukan</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Profil Anda belum terhubung dengan data siswa di sistem. Mohon hubungi guru atau admin sekolah untuk memastikan data Anda sudah terdaftar dengan email yang benar.</p>
        </CardContent>
      </Card>
    );
  }

  if (!studentData.habits) {
    return (
       <Card>
        <CardHeader>
          <CardTitle>Data Kebiasaan Belum Ada</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Data kebiasaan untuk Anda belum diinisialisasi. Mohon hubungi guru atau admin sekolah.</p>
        </CardContent>
      </Card>
    )
  }

  const totalScore = studentData.habits.reduce((acc, h) => {
      if (!h.subHabits || h.subHabits.length === 0) return acc;
      const subHabitTotal = h.subHabits.reduce((subAcc, sh) => subAcc + sh.score, 0);
      return acc + (subHabitTotal / (h.subHabits.length || 1));
  }, 0);
  const averageScore = totalScore / (studentData.habits.length || 1);


  return (
    <>
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Halo, {studentData.name}!</h1>
        <p className="text-muted-foreground">Selamat datang di dasbor pribadimu. Pantau terus perkembanganmu!</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Progres Kebiasaanmu</CardTitle>
          <CardDescription>
              Berikut adalah rekapitulasi nilai dari 7 kebiasaan inti yang kamu jalani. Klik setiap kebiasaan untuk melihat rincian aspeknya.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
             <Accordion type="single" collapsible className="w-full">
                {studentData.habits.map((habit) => {
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
                    <Progress value={(averageScore / 4) * 100} className="w-24 h-2" />
                    <span className="font-mono text-sm">{averageScore.toFixed(1)}</span>
                </div>
            </div>

          </div>
        </CardContent>
      </Card>
    </>
  );
}

