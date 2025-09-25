
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
import { overallHabitData } from '@/lib/mock-data';
import {
  Sunrise,
  BookOpen,
  HeartPulse,
  Users,
  TrendingUp,
  Activity,
  ArrowUp,
  ArrowDown,
  Minus,
  Utensils,
  HandHelping,
  Church,
  Bed,
} from 'lucide-react';
import type { Student, Habit } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useStudent } from '@/contexts/student-context';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';
import React, { useState, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { HABIT_DEFINITIONS } from '@/lib/types';


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
  const { students } = useStudent();
  const { language } = useLanguage();
  const [selectedClass, setSelectedClass] = useState('all');

  const t = translations[language]?.dashboardPage || translations.en.dashboardPage;
  const tHabits =
    translations[language]?.landingPage.habits ||
    translations.en.landingPage.habits;

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
          <CardTitle>{t.overallHabitProgress}</CardTitle>
          <CardDescription>Klik pada setiap kebiasaan untuk melihat rincian aspeknya.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full space-y-2">
            {overallHabitData.map(habit => {
                const translatedName = habitTranslationMapping[habit.name] || habit.name;
                const aspects = HABIT_DEFINITIONS[habit.name] || [];

                return (
                  <AccordionItem value={habit.name} key={habit.name} className="border rounded-md px-4">
                    <AccordionTrigger className="hover:no-underline py-3">
                       <div className="flex items-center gap-3 w-full">
                          {habitIcons[habit.name]}
                          <span className="font-medium flex-1 text-left">{translatedName}</span>
                           <div className="flex items-center gap-2 pr-2">
                               <Progress
                                value={habit['Minggu Ini']}
                                className="w-24 h-2"
                                />
                               <span className="font-mono text-lg font-bold">
                                {habit['Minggu Ini']}%
                               </span>
                           </div>
                       </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-8 pr-4 pt-2 pb-4 space-y-2">
                        <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Aspek yang dinilai:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {aspects.map((aspect, index) => (
                            <li key={index}>{aspect}</li>
                          ))}
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <CardTitle>{t.individualProgress}</CardTitle>
                <CardDescription>
                  Klik pada siswa untuk melihat rincian progres kebiasaan.
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
           <Accordion type="multiple" className="w-full space-y-2">
            {filteredStudents.map((student: Student) => {
              if (!student.habits) return null;
              const overallAverage = calculateOverallAverage(student);

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
                        <Accordion type="multiple" className="w-full space-y-1">
                          {(student.habits).map((habit) => {
                              const habitAverage = (!habit.subHabits || habit.subHabits.length === 0) 
                                  ? 0 
                                  : habit.subHabits.reduce((acc, sub) => acc + sub.score, 0) / (habit.subHabits.length || 1);
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
                      </div>
                   </AccordionContent>
                </AccordionItem>
              );
            })}
           </Accordion>
        </CardContent>
      </Card>
    </>
  );
}
