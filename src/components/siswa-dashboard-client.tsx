'use client';

import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
import { useState, useMemo, useCallback } from 'react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { format, subDays, eachDayOfInterval, startOfDay, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Habit, HabitEntry, Student } from '@/lib/types';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from './ui/date-range-picker';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, LabelList } from 'recharts';
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

const habitColors: { [key: string]: string } = {
    'Bangun Pagi': 'hsl(var(--chart-1))',
    'Taat Beribadah': 'hsl(var(--chart-2))',
    'Rajin Olahraga': 'hsl(var(--chart-3))',
    'Makan Sehat & Bergizi': 'hsl(var(--chart-4))',
    'Gemar Belajar': 'hsl(var(--chart-5))',
    'Bermasyarakat': '#8B5CF6',
    'Tidur Cepat': '#10B981',
};

interface SiswaDashboardClientProps {
  studentData: Student;
  habitEntries: HabitEntry[];
}


export function SiswaDashboardClient({ studentData, habitEntries }: SiswaDashboardClientProps) {
  const language = 'id';
  const tHabits = translations[language]?.landingPage.habits || translations.en.landingPage.habits;

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 6),
    to: new Date(),
  });

  const getHabitsForDate = useCallback((date: Date): Habit[] => {
      if (!studentData) return [];
      
      const relevantEntries = habitEntries.filter(entry => 
        isSameDay(entry.date, date)
      );
      
      const habitsFromDefs: Habit[] = Object.entries(HABIT_DEFINITIONS).map(([habitName, subHabitNames], habitIndex) => ({
        id: `${habitIndex + 1}`,
        name: habitName,
        subHabits: subHabitNames.map((subHabitName, subHabitIndex) => {
          const entry = relevantEntries
              .filter(e => e.habitName === habitName && e.subHabitName === subHabitName)
              .sort((a, b) => (b.timestamp as any).toMillis() - (a.timestamp as any).toMillis())[0];

          return {
            id: `${habitIndex + 1}-${subHabitIndex + 1}`,
            name: subHabitName,
            score: entry ? entry.score : 0,
          };
        }),
      }));
      return habitsFromDefs;

  }, [studentData, habitEntries]);

  const habitsForSelectedDate = getHabitsForDate(selectedDate);

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

  const chartData = useMemo(() => {
    if (!dateRange?.from || !studentData) return [];

    const from = startOfDay(dateRange.from);
    const to = dateRange.to || startOfDay(dateRange.from);
    const intervalDays = eachDayOfInterval({ start: from, end: to });
    const relevantEntries = habitEntries.filter(entry => 
        entry.date >= from &&
        entry.date <= to
    );

    const dataByDate = intervalDays.map(day => {
      const formattedDate = format(day, 'dd/MM');
      const entriesForDay = relevantEntries.filter(e => isSameDay(e.date, day));
      
      const result: { date: string, [key: string]: any } = { date: formattedDate };
      
      Object.keys(HABIT_DEFINITIONS).forEach(habitName => {
        const habitEntriesForDay = entriesForDay.filter(e => e.habitName === habitName);
        if (habitEntriesForDay.length > 0) {
            const habitAvg = habitEntriesForDay.reduce((sum, e) => sum + e.score, 0) / habitEntriesForDay.length;
            result[habitName] = habitAvg;
        } else {
            result[habitName] = 0;
        }
      });
      return result;
    });
    
    return dataByDate;

  }, [dateRange, studentData, habitEntries]);
  
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
  
  const dailySummaryData = prepareDailySummaryChartData(habitsForSelectedDate);

  if (!studentData) {
      return (
          <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-4 text-muted-foreground">Memuat data siswa...</p>
          </div>
      )
  }

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
              <CardTitle>Grafik Perkembangan Kebiasaanmu</CardTitle>
              <CardDescription>
                  Visualisasikan tren skormu pada rentang tanggal yang dipilih.
              </CardDescription>
              </div>
              <DateRangePicker date={dateRange} onDateChange={setDateRange} />
          </div>
          </CardHeader>
          <CardContent>
              <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                      data={chartData}
                      margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
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
                      <Legend formatter={(value) => (<span className="text-muted-foreground">{habitTranslationMapping[value] || value}</span>)} />
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
          </CardContent>
      </Card>


       <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Rincian Progres Harianmu</CardTitle>
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
                  locale={id}
                  />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          {habitsForSelectedDate.length > 0 && habitsForSelectedDate.some(h => h.subHabits.some(sh => sh.score > 0)) ? (
            <div className="space-y-4">
                 {dailySummaryData.length > 0 ? (
                    <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-semibold text-sm mb-2 text-center">Ringkasan Rata-Rata per Kebiasaan</h4>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={dailySummaryData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis domain={[0, 4]} allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} />
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
                                  <LabelList dataKey="average" position="top" className="fill-foreground" fontSize={12} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Tidak ada data untuk ditampilkan pada grafik ringkasan.</p>
                )}


               <Accordion type="multiple" className="w-full">
                  {habitsForSelectedDate.map((habit) => {
                      const subHabitsWithScores = habit.subHabits.filter(sh => sh.score > 0);
                      if (subHabitsWithScores.length === 0) return null;

                      const habitAverage = subHabitsWithScores.reduce((acc, sub) => acc + sub.score, 0) / subHabitsWithScores.length;

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
                                      {habit.subHabits && habit.subHabits.filter(sh => sh.score > 0).length > 0 ? (
                                          habit.subHabits.filter(sh => sh.score > 0).map(subHabit => (
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
                  }).filter(Boolean)}
              </Accordion>
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
