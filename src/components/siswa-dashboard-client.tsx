



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
  Bed,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Habit } from '@/lib/types';


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
  const { students, loading: studentsLoading, getHabitsForDate, fetchHabitEntriesForDate, dateLoading } = useStudent();
  const { language } = useLanguage();
  const tHabits = translations[language]?.landingPage.habits || translations.en.landingPage.habits;

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const studentData = students.find(s => s.email === user?.email);
  
  useEffect(() => {
    if (studentData) {
      const unsubscribe = fetchHabitEntriesForDate(selectedDate);
      return () => unsubscribe();
    }
  }, [selectedDate, studentData, fetchHabitEntriesForDate]);

  const habitsForSelectedDate = studentData ? getHabitsForDate(studentData.id, selectedDate) : [];

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
  
  const calculateOverallAverage = (habits: Habit[]) => {
      if (!habits || habits.length === 0) return 0;
      const validHabits = habits.filter(h => h.subHabits && h.subHabits.length > 0 && h.subHabits.some(sh => sh.score > 0));
      if (validHabits.length === 0) return 0;

      const totalScore = validHabits.reduce((acc, h) => {
          const subHabitsWithScores = h.subHabits.filter(sh => sh.score > 0);
          const subHabitTotal = subHabitsWithScores.reduce((subAcc, sh) => subAcc + sh.score, 0);
          const subHabitAverage = subHabitTotal / (subHabitsWithScores.length || 1);
          return acc + subHabitAverage;
      }, 0);
      
      return totalScore / (validHabits.length || 1);
  };

  const averageScore = calculateOverallAverage(habitsForSelectedDate);

  return (
    <>
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Halo, {studentData.name}!</h1>
        <p className="text-muted-foreground">Selamat datang di dasbor pribadimu. Pantau terus perkembanganmu!</p>
      </header>
      
       <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Progres Kebiasaanmu</CardTitle>
              <CardDescription>
                  Pilih tanggal untuk melihat progres kebiasaanmu pada hari itu.
              </CardDescription>
            </div>
             <Popover>
              <PopoverTrigger asChild>
                  <Button
                  variant={'outline'}
                  className={cn(
                      'w-full sm:w-[280px] justify-start text-left font-normal',
                      !selectedDate && 'text-muted-foreground'
                  )}
                  >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'PPP', { locale: id }) : <span>Pilih tanggal</span>}
                  </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                  <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => setSelectedDate(date || new Date())}
                  initialFocus
                  />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          {dateLoading ? (
             <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             </div>
          ) : habitsForSelectedDate.length > 0 && habitsForSelectedDate.some(h => h.subHabits.some(sh => sh.score > 0)) ? (
            <div className="space-y-4">
               <Accordion type="multiple" className="w-full">
                  {habitsForSelectedDate.map((habit) => {
                      const habitAverage = (!habit.subHabits || habit.subHabits.length === 0 || habit.subHabits.every(sh => sh.score === 0))
                          ? 0 
                          : habit.subHabits.reduce((acc, sub) => acc + sub.score, 0) / (habit.subHabits.filter(sh => sh.score > 0).length || 1);

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
          ) : (
            <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Tidak ada data yang tercatat untuk tanggal ini.</p>
                <p className="text-sm text-muted-foreground mt-1">Silakan pilih tanggal lain atau input data baru.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}



    