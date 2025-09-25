



'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Sunrise,
  BookOpen,
  HeartPulse,
  Users,
  TrendingUp,
  Activity,
  Utensils,
  HandHelping,
  Church,
  Bed,
  Calendar as CalendarIcon,
} from 'lucide-react';
import type { Student, Habit, SubHabit } from '@/lib/types';
import { useStudent } from '@/contexts/student-context';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';
import React, { useState, useMemo, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { HABIT_DEFINITIONS } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar } from './ui/calendar';
import { Loader2 } from 'lucide-react';

const habitIcons: { [key: string]: React.ReactNode } = {
  'Bangun Pagi': <Sunrise className="h-5 w-5 text-yellow-500" />,
  'Taat Beribadah': <Church className="h-5 w-5 text-purple-500" />,
  'Rajin Olahraga': <HeartPulse className="h-5 w-5 text-red-500" />,
  'Makan Sehat & Bergizi': <Utensils className="h-5 w-5 text-green-500" />,
  'Gemar Belajar': <BookOpen className="h-5 w-5 text-blue-500" />,
  'Bermasyarakat': <HandHelping className="h-5 w-5 text-orange-500" />,
  'Tidur Cepat': <Bed className="h-5 w-5 text-indigo-500" />,
};

export function DashboardClient() {
  const { students, getHabitsForDate, fetchHabitEntriesForDate, dateLoading } = useStudent();
  const { language } = useLanguage();
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const t = translations[language]?.dashboardPage || translations.en.dashboardPage;
  const tHabits =
    translations[language]?.landingPage.habits ||
    translations.en.landingPage.habits;

  useEffect(() => {
    const unsubscribe = fetchHabitEntriesForDate(selectedDate);
    return () => unsubscribe();
  }, [selectedDate, fetchHabitEntriesForDate]);

  const habitTranslationMapping: Record<string, string> = {
    'Bangun Pagi': tHabits.bangunPagi.name,
    'Taat Beribadah': tHabits.taatBeribadah.name,
    'Rajin Olahraga': tHabits.rajinOlahraga.name,
    'Makan Sehat & Bergizi': tHabits.makanSehat.name,
    'Gemar Belajar': tHabits.gemarBelajar.name,
    'Bermasyarakat': tHabits.bermasyarakat.name,
    'Tidur Cepat': tHabits.tidurCepat.name,
  };

  const classList = useMemo(() => {
    const classes = new Set(students.map(s => s.class));
    return ['all', ...Array.from(classes).sort()];
  }, [students]);

  const filteredStudents = useMemo(() => {
    if (selectedClass === 'all') {
      return students;
    }
    return students.filter(student => student.class === selectedClass);
  }, [students, selectedClass]);
  
  const getHabitsForStudentOnDate = (studentId: string, date: Date): Habit[] => {
    return getHabitsForDate(studentId, date);
  };
  
  const calculateOverallAverage = (habits: Habit[]) => {
    if (!habits || habits.length === 0) return 0;
    
    const validHabits = habits.filter(h => h.subHabits && h.subHabits.length > 0 && h.subHabits.some(sh => sh.score > 0));
    if (validHabits.length === 0) return 0;

    const totalScore = validHabits.reduce((acc, h) => {
      const subHabitTotal = h.subHabits.reduce((subAcc, sh) => subAcc + sh.score, 0);
      const subHabitAverage = subHabitTotal / (h.subHabits.length || 1);
      return acc + subHabitAverage;
    }, 0);

    return totalScore / validHabits.length;
  };


  const overallHabitAverages = useMemo(() => {
    if (filteredStudents.length === 0) {
      return [];
    }

    const habitData: { [habitName: string]: { [subHabitName: string]: { total: number, count: number } } } = {};

    Object.keys(HABIT_DEFINITIONS).forEach(habitName => {
        habitData[habitName] = {};
        HABIT_DEFINITIONS[habitName].forEach(subHabitName => {
            habitData[habitName][subHabitName] = { total: 0, count: 0 };
        });
    });

    for (const student of filteredStudents) {
      const studentHabitsForDate = getHabitsForStudentOnDate(student.id, selectedDate);
      for (const habit of studentHabitsForDate) {
        for (const subHabit of habit.subHabits) {
          if(subHabit.score > 0) { // Only count scores that have been entered
            habitData[habit.name][subHabit.name].total += subHabit.score;
            habitData[habit.name][subHabit.name].count++;
          }
        }
      }
    }

    const result = Object.entries(habitData).map(([habitName, subHabits]) => {
      const subHabitAverages = Object.entries(subHabits).map(([subHabitName, data]) => ({
        name: subHabitName,
        averageScore: data.count > 0 ? data.total / data.count : 0,
      }));

      const validSubHabits = subHabitAverages.filter(sh => sh.averageScore > 0);
      const overallHabitAverage = validSubHabits.reduce((acc, curr) => acc + curr.averageScore, 0) / (validSubHabits.length || 1);
      
      return {
        name: habitName,
        averageScore: overallHabitAverage,
        subHabits: subHabitAverages,
      };
    });

    return result;

  }, [filteredStudents, selectedDate, getHabitsForStudentOnDate]);


  return (
    <>
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-muted-foreground">{t.welcome}</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.totalStudents}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredStudents.length}</div>
            <p className="text-xs text-muted-foreground">
              {selectedClass === 'all' ? 'Siswa aktif terpantau' : `Siswa di kelas ${selectedClass}`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.averageEngagement}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85.2%</div>
            <p className="text-xs text-muted-foreground">{t.engagementTrend}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.monitoredHabits}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">
              {t.coreHabitsMonitored}
            </p>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Rata-rata Perkembangan Kebiasaan</CardTitle>
              <CardDescription>
                Skor rata-rata kebiasaan di seluruh siswa yang ditampilkan untuk tanggal yang dipilih.
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
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
           <Accordion type="multiple" className="w-full space-y-2">
            {overallHabitAverages.map((habit, index) => (
              <AccordionItem value={habit.name} key={index} className="border rounded-md px-4">
                 <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-3 w-full">
                       {habitIcons[habit.name]}
                      <div className="flex-1 text-left">
                        <span className="font-medium">{habitTranslationMapping[habit.name] || habit.name}</span>
                      </div>
                      <div className="flex items-center gap-2 pr-2">
                         <span className='text-sm text-muted-foreground'>Rata-rata Kelas:</span>
                         <Progress value={(habit.averageScore / 4) * 100} className="w-24 h-2" />
                         <span className="font-mono text-lg font-bold">{habit.averageScore.toFixed(1)}</span>
                      </div>
                    </div>
                 </AccordionTrigger>
                 <AccordionContent>
                    <div className="pl-8 pr-4 pt-2 pb-4 space-y-3">
                      <h4 className="font-semibold text-sm mb-2">Rincian Rata-rata Aspek:</h4>
                      {habit.subHabits && habit.subHabits.length > 0 ? (
                          habit.subHabits.map(subHabit => (
                              <div key={subHabit.name} className="flex items-center justify-between text-xs">
                                  <p className="text-muted-foreground flex-1 pr-4">{subHabit.name}</p>
                                  <div className="flex items-center gap-2 w-28">
                                      <Progress value={(subHabit.averageScore / 4) * 100} className="w-16 h-1.5" />
                                      <span className="font-mono text-xs font-semibold">{subHabit.averageScore.toFixed(2)}</span>
                                  </div>
                              </div>
                          ))
                      ) : (
                          <p className="text-xs text-muted-foreground">Tidak ada aspek yang tercatat.</p>
                      )}
                    </div>
                 </AccordionContent>
              </AccordionItem>
            ))}
           </Accordion>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <CardTitle>{t.individualProgress}</CardTitle>
                <CardDescription>
                  Progres siswa untuk tanggal: {format(selectedDate, 'PPP', { locale: id })}.
                </CardDescription>
            </div>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Pilih kelas..." />
              </SelectTrigger>
              <SelectContent>
                {classList.map(className => (
                  <SelectItem key={className} value={className}>
                    {className === 'all' ? 'Semua Kelas' : `Kelas ${className}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {dateLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
           <Accordion type="multiple" className="w-full space-y-2">
            {filteredStudents.map((student: Student) => {
              const studentHabitsOnDate = getHabitsForStudentOnDate(student.id, selectedDate);
              const overallAverage = calculateOverallAverage(studentHabitsOnDate);

              return (
                <AccordionItem value={student.id} key={student.id} className="border rounded-md px-4">
                   <AccordionTrigger className="hover:no-underline py-3">
                      <div className="flex items-center gap-3 w-full">
                        <Avatar>
                          <AvatarImage
                            src={student.avatarUrl}
                            alt={student.name}
                            data-ai-hint="person portrait"
                          />
                          <AvatarFallback>
                            {student.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left">
                          <span className="font-medium">{student.name}</span>
                           <Badge variant="secondary" className="ml-2">{student.class}</Badge>
                        </div>
                        <div className="flex items-center gap-2 pr-2">
                           <span className='text-sm text-muted-foreground'>Rata-rata:</span>
                           <Progress value={(overallAverage / 4) * 100} className="w-24 h-2" />
                           <span className="font-mono text-lg font-bold">{overallAverage.toFixed(1)}</span>
                        </div>
                      </div>
                   </AccordionTrigger>
                   <AccordionContent>
                      <div className="pl-12 pr-4 pt-2 pb-2 space-y-3">
                        <h4 className="font-semibold text-sm mb-2">Rincian Kebiasaan:</h4>
                        {studentHabitsOnDate.some(h => h.subHabits.some(sh => sh.score > 0)) ? (
                          <Accordion type="multiple" className="w-full space-y-1">
                            {studentHabitsOnDate.map((habit) => {
                                const habitAverage = (!habit.subHabits || habit.subHabits.length === 0 || habit.subHabits.every(sh => sh.score === 0))
                                    ? 0
                                    : habit.subHabits.reduce((acc, sub) => acc + sub.score, 0) / (habit.subHabits.filter(sh => sh.score > 0).length || 1);
                                return(
                                  <AccordionItem value={habit.id} key={habit.id}>
                                    <AccordionTrigger className="hover:no-underline text-sm py-2 rounded-md hover:bg-muted/50 px-2">
                                        <div className="flex items-center gap-3 w-full">
                                            {habitIcons[habit.name]}
                                            <span className="font-medium flex-1 text-left">{habitTranslationMapping[habit.name] || habit.name}</span>
                                            <div className="flex items-center gap-2 pr-2">
                                                <Progress value={(habitAverage / 4) * 100} className="w-20 h-1.5" />
                                                <span className="font-mono text-sm font-semibold">{habitAverage.toFixed(1)}</span>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                     <AccordionContent className="pt-2">
                                         <div className="pl-8 pr-4 space-y-2">
                                            {habit.subHabits && habit.subHabits.length > 0 ? (
                                                habit.subHabits.map(subHabit => (
                                                    <div key={subHabit.id} className="flex items-center justify-between text-xs">
                                                        <p className="text-muted-foreground flex-1 pr-4">{subHabit.name}</p>
                                                        <div className="flex items-center gap-2 w-24">
                                                            <Progress value={(subHabit.score / 4) * 100} className="w-16 h-1" />
                                                            <span className="font-mono text-xs font-semibold">{subHabit.score}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-xs text-muted-foreground">Tidak ada aspek yang tercatat.</p>
                                            )}
                                        </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                )
                              })}
                          </Accordion>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">Tidak ada data tercatat untuk siswa ini pada tanggal yang dipilih.</p>
                        )}
                      </div>
                   </AccordionContent>
                </AccordionItem>
              );
            })}
           </Accordion>
          )}
        </CardContent>
      </Card>
    </>
  );
}



    