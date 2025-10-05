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
  Lock,
  Unlock,
} from 'lucide-react';
import type { Student, Habit, SubHabit, HabitEntry } from '@/lib/types';
import { translations } from '@/lib/translations';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
import { format, startOfDay, eachDayOfInterval, subDays, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar } from './ui/calendar';
import { Loader2 } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  LabelList,
} from 'recharts';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from './ui/date-range-picker';
import { useToast } from '@/hooks/use-toast';
import { collection, onSnapshot, query, doc, updateDoc, arrayUnion, arrayRemove, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/firebase';

const habitIcons: { [key: string]: React.ReactNode } = {
  'Bangun Pagi': <Sunrise className="h-5 w-5 text-yellow-500" />,
  'Taat Beribadah': <Church className="h-5 w-5 text-purple-500" />,
  'Rajin Olahraga': <HeartPulse className="h-5 w-5 text-red-500" />,
  'Makan Sehat & Bergizi': <Utensils className="h-5 w-5 text-green-500" />,
  'Gemar Belajar': <BookOpen className="h-5 w-5 text-blue-500" />,
  'Bermasyarakat': <HandHelping className="h-5 w-5 text-orange-500" />,
  'Tidur Cepat': <Bed className="h-5 w-5 text-indigo-500" />,
};

const habitColors: { [key: string]: string } = {
    'Bangun Pagi': 'hsl(var(--chart-1))',
    'Taat Beribadah': 'hsl(var(--chart-2))',
    'Rajin Olahraga': 'hsl(var(--chart-3))',
    'Makan Sehat & Bergizi': 'hsl(var(--chart-4))',
    'Gemar Belajar': 'hsl(var(--chart-5))',
    'Bermasyarakat': '#8B5CF6',
    'Tidur Cepat': '#10B981',
};


export function DashboardClient() {
  const { students, habitEntries, loading } = useAuth();
  
  const language = 'id';
  const [selectedClass, setSelectedClass] = useState('all');
  const { toast } = useToast();
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 6),
    to: new Date(),
  });

  const [singleDate, setSingleDate] = useState<Date>(new Date());

  const t = translations[language]?.dashboardPage || translations.en.dashboardPage;
  const tHabits =
    translations[language]?.landingPage.habits ||
    translations.en.landingPage.habits;

  const getHabitsForDate = useCallback((studentId: string, date: Date): Habit[] => {
      const student = students.find(s => s.id === studentId);
      if (!student) return [];
      
      const relevantEntries = habitEntries.filter(entry => 
        entry.studentId === studentId && isSameDay(entry.date, date)
      );
      
      const habitsFromDefs: Habit[] = Object.entries(HABIT_DEFINITIONS).map(([habitName, subHabitNames], habitIndex) => ({
        id: `${habitIndex + 1}`,
        name: habitName,
        subHabits: subHabitNames.map((subHabitName, subHabitIndex) => {
          const entry = relevantEntries
              .filter(e => e.habitName === habitName && e.subHabitName === subHabitName)
              .sort((a, b) => (b.timestamp as Timestamp).toMillis() - (a.timestamp as Timestamp).toMillis())[0];

          return {
            id: `${habitIndex + 1}-${subHabitIndex + 1}`,
            name: subHabitName,
            score: entry ? entry.score : 0,
          };
        }),
      }));
      return habitsFromDefs;

  }, [students, habitEntries]);
  
  const toggleDateLock = async (studentId: string, date: Date, lock: boolean) => {
    const studentDocRef = doc(db, 'students', studentId);
    const formattedDate = format(date, 'yyyy-MM-dd');

    await updateDoc(studentDocRef, {
      lockedDates: lock ? arrayUnion(formattedDate) : arrayRemove(formattedDate),
    });
  };

  const filteredStudents = useMemo(() => {
    if (selectedClass === 'all') {
      return students;
    }
    return students.filter(student => student.class === selectedClass);
  }, [students, selectedClass]);

  const areAllLocked = useMemo(() => {
    if (filteredStudents.length === 0) return false;
    const formattedDate = format(singleDate, 'yyyy-MM-dd');
    const lockedCount = filteredStudents.filter(student => student.lockedDates?.includes(formattedDate)).length;
    return lockedCount > filteredStudents.length / 2;
  }, [filteredStudents, singleDate]);
  
  const handleToggleAllLocks = async () => {
    const date = singleDate;
    if (!date) return;
    const lockAction = !areAllLocked;

    try {
        await Promise.all(
            filteredStudents.map(student => toggleDateLock(student.id, date, lockAction))
        );
        toast({
            title: 'Sukses',
            description: `Nilai untuk tanggal ${format(date, 'PPP', { locale: id })} berhasil di${lockAction ? 'kunci' : 'buka'} untuk semua siswa yang ditampilkan.`,
        });
    } catch (error) {
        console.error("Failed to toggle all scores:", error);
        toast({
            variant: "destructive",
            title: "Gagal",
            description: "Terjadi kesalahan saat mencoba mengubah status kunci semua nilai.",
        });
    }
  };

  const habitTranslationMapping: Record<string, string> = {
    'Bangun Pagi': tHabits.bangunPagi.name,
    'Taat Beribadah': tHabits.taatBeribadah.name,
    'Rajin Olahraga': tHabits.rajinOlahraga.name,
    'Makan Sehat & Bergizi': tHabits.makanSehat.name,
    'Gemar Belajar': tHabits.gemarBelajar.name,
    'Bermasyarakat': tHabits.bermasyarakat.name,
    'Tidur Cepat': tHabits.tidurCepat.name,
  };
  
  const shortHabitNames: Record<string, string> = {
    'Bangun Pagi': 'Pagi',
    'Taat Beribadah': 'Ibadah',
    'Rajin Olahraga': 'Olahraga',
    'Makan Sehat & Bergizi': 'Makan',
    'Gemar Belajar': 'Belajar',
    'Bermasyarakat': 'Sosial',
    'Tidur Cepat': 'Tidur',
  };

  const classList = useMemo(() => {
    const classes = new Set(students.map(s => s.class).filter(Boolean));
    return ['all', ...Array.from(classes).sort()];
  }, [students]);

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

    return totalScore / validHabits.length;
  };
  
  const prepareDailySummaryChartData = (habits: Habit[]) => {
    if (!habits || habits.length === 0) return [];
    
    return Object.keys(HABIT_DEFINITIONS).map(habitName => {
        const habit = habits.find(h => h.name === habitName);
        let average = 0;
        if (habit) {
            const subHabitsWithScores = habit.subHabits.filter(sh => sh.score > 0);
            if (subHabitsWithScores.length > 0) {
                average = subHabitsWithScores.reduce((acc, sub) => acc + sub.score, 0) / subHabitsWithScores.length;
            }
        }
        return {
            name: shortHabitNames[habitName] || habitName,
            average: parseFloat(average.toFixed(1)),
            fill: habitColors[habitName] || '#8884d8'
        };
    }).filter(d => d.average > 0);
  };

  const chartData = useMemo(() => {
    if (!dateRange?.from || filteredStudents.length === 0) return [];
    
    const from = startOfDay(dateRange.from);
    const to = dateRange.to ? startOfDay(dateRange.to) : startOfDay(dateRange.from);
    const intervalDays = eachDayOfInterval({ start: from, end: to });
    
    const relevantEntries = habitEntries.filter(entry => entry.date >= from && entry.date <= to);

    const dataByDate = intervalDays.map(day => {
      const formattedDate = format(day, 'dd/MM');
      const dailyScores: { [habitName: string]: { total: number, count: number } } = {};

      for (const student of filteredStudents) {
          const studentEntriesForDay = relevantEntries.filter(e => e.studentId === student.id && isSameDay(e.date, day));
          
          Object.keys(HABIT_DEFINITIONS).forEach(habitName => {
              const habitEntriesForDay = studentEntriesForDay.filter(e => e.habitName === habitName);
              if (habitEntriesForDay.length > 0) {
                  if (!dailyScores[habitName]) {
                      dailyScores[habitName] = { total: 0, count: 0 };
                  }
                  const habitAvg = habitEntriesForDay.reduce((sum, e) => sum + e.score, 0) / habitEntriesForDay.length;
                  dailyScores[habitName].total += habitAvg;
                  dailyScores[habitName].count += 1;
              }
          });
      }

      const result: { date: string, [key: string]: any } = { date: formattedDate };
      Object.keys(HABIT_DEFINITIONS).forEach(habitName => {
        const data = dailyScores[habitName];
        result[habitName] = data && data.count > 0 ? (data.total / data.count) : 0;
      });
      
      return result;
    });

    return dataByDate;

  }, [dateRange, filteredStudents, habitEntries]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
              <CardTitle>Grafik Perkembangan Kebiasaan</CardTitle>
              <CardDescription>
                Visualisasikan tren rata-rata skor kebiasaan berdasarkan rentang tanggal yang dipilih.
              </CardDescription>
            </div>
             <DateRangePicker date={dateRange} onDateChange={setDateRange} />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-80 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="h-80 w-full">
               <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{
                            top: 5,
                            right: 20,
                            left: -10,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis domain={[0, 4]} fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{
                                background: 'hsl(var(--background))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: 'var(--radius)',
                            }}
                        />
                        <Legend
                          formatter={(value) => (
                              <span className="text-muted-foreground">{habitTranslationMapping[value] || value}</span>
                          )}
                        />
                        {Object.keys(HABIT_DEFINITIONS).map((habitName) => (
                            <Line
                                key={habitName}
                                type="monotone"
                                dataKey={habitName}
                                stroke={habitColors[habitName] || '#8884d8'}
                                strokeWidth={2}
                                dot={false}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <CardTitle>{t.individualProgress}</CardTitle>
                <CardDescription>
                  Progres siswa untuk tanggal: {format(singleDate, 'PPP', { locale: id })}.
                </CardDescription>
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              <Popover>
                <PopoverTrigger asChild>
                    <Button
                    variant={'outline'}
                    className={cn(
                        'w-[240px] justify-start text-left font-normal',
                        !singleDate && 'text-muted-foreground'
                    )}
                    >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {singleDate ? format(singleDate, 'PPP', { locale: id }) : <span>Pilih tanggal</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                    mode="single"
                    selected={singleDate}
                    onSelect={(date) => setSingleDate(date || new Date())}
                    initialFocus
                    locale={id}
                    />
                </PopoverContent>
              </Popover>
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
               <Button onClick={handleToggleAllLocks} size="sm" variant="outline">
                {areAllLocked ? <Unlock className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
                {areAllLocked ? 'Buka Kunci Nilai Hari Ini' : 'Kunci Nilai Hari Ini'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
           <Accordion type="multiple" className="w-full space-y-2">
            {filteredStudents.map((student: Student) => {
              const studentHabitsOnDate = getHabitsForDate(student.id, singleDate);
              const overallAverage = calculateOverallAverage(studentHabitsOnDate);
              const isLocked = student.lockedDates?.includes(format(singleDate, 'yyyy-MM-dd'));
              const dailySummaryData = prepareDailySummaryChartData(studentHabitsOnDate);

              return (
                <AccordionItem value={student.id} key={student.id} className="border rounded-md">
                  <div className="flex items-center px-4 py-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleDateLock(student.id, singleDate, !isLocked)}
                    >
                      {isLocked ? <Lock className="h-4 w-4 text-destructive" /> : <Unlock className="h-4 w-4 text-muted-foreground" />}
                      <span className="sr-only">Toggle Lock</span>
                    </Button>
                    <AccordionTrigger className="flex-1 hover:no-underline py-2">
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
                  </div>
                   <AccordionContent>
                      <div className="pl-12 pr-4 pt-2 pb-4 space-y-3">
                        {dailySummaryData.length > 0 ? (
                            <div className="bg-muted/50 p-4 rounded-lg">
                                <h4 className="font-semibold text-sm mb-2 text-center">Ringkasan Rata-Rata per Kebiasaan</h4>
                                <ResponsiveContainer width="100%" height={150}>
                                    <BarChart data={dailySummaryData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis domain={[0, 4]} allowDecimals={false} fontSize={10} tickLine={false} axisLine={false}/>
                                        <Tooltip
                                            cursor={{fill: 'hsla(var(--muted))'}}
                                            contentStyle={{
                                                background: 'hsl(var(--background))',
                                                border: '1px solid hsl(var(--border))',
                                                borderRadius: 'var(--radius)',
                                                fontSize: '12px',
                                            }}
                                            labelStyle={{fontWeight: 'bold'}}
                                         />
                                        <Bar dataKey="average" name="Rata-rata" radius={[4, 4, 0, 0]}>
                                           <LabelList dataKey="average" position="top" className="fill-foreground" fontSize={10} />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                          <div className="bg-muted/50 p-4 rounded-lg text-center">
                            <p className="text-sm text-muted-foreground">Tidak ada data untuk ditampilkan pada grafik ringkasan.</p>
                          </div>
                        )}

                        <h4 className="font-semibold text-sm pt-2">Rincian Kebiasaan:</h4>
                        {studentHabitsOnDate.some(h => h.subHabits.some(sh => sh.score > 0)) ? (
                          <Accordion type="multiple" className="w-full space-y-1">
                            {studentHabitsOnDate.map((habit) => {
                                const subHabitsWithScores = habit.subHabits.filter(sh => sh.score > 0);
                                const habitAverage = subHabitsWithScores.length === 0
                                    ? 0
                                    : subHabitsWithScores.reduce((acc, sub) => acc + sub.score, 0) / (subHabitsWithScores.length || 1);
                                
                                if (habitAverage === 0) return null;
                                
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
                                            {habit.subHabits && habit.subHabits.filter(sh => sh.score > 0).length > 0 ? (
                                                habit.subHabits.filter(sh => sh.score > 0).map(subHabit => (
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
