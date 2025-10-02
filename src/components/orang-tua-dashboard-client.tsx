'use client';

import { useAuth } from '@/contexts/auth-context';
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
import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Student, Habit, HabitEntry } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { format, startOfDay, eachDayOfInterval, subDays, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from './ui/date-range-picker';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar, BarChart, LabelList } from 'recharts';
import { HABIT_DEFINITIONS } from '@/lib/types';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';


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


export function OrangTuaDashboardClient() {
  const { userProfile } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [habitEntries, setHabitEntries] = useState<HabitEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [entriesLoading, setEntriesLoading] = useState(true);

  const { language } = useLanguage();
  const tHabits = translations[language]?.landingPage.habits || translations.en.landingPage.habits;

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 6),
    to: new Date(),
  });
  
  useEffect(() => {
    if (userProfile && userProfile.role === 'orangtua') {
      setLoading(true);
      const q = query(collection(db, 'students'), where('parentId', '==', userProfile.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const studentData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
        setStudents(studentData);
        if (studentData.length > 0 && !selectedStudentId) {
          setSelectedStudentId(studentData[0].id);
        }
        setLoading(false);
      }, (error) => {
        console.error("Failed to fetch parent's students:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [userProfile, selectedStudentId]);

 useEffect(() => {
    if (students.length === 0) {
      setEntriesLoading(false);
      return;
    };
    setEntriesLoading(true);

    const studentIds = students.map(s => s.id);
    const q = query(collection(db, 'habit_entries'), where('studentId', 'in', studentIds));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const entries: HabitEntry[] = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.date && data.timestamp) {
            entries.push({
            id: doc.id,
            ...data,
            date: (data.date as Timestamp).toDate(),
            timestamp: data.timestamp,
            } as HabitEntry);
        }
      });
      setHabitEntries(entries);
      setEntriesLoading(false);
    }, (error) => {
      console.error("Error fetching habit entries for parent:", error);
      setEntriesLoading(false);
    });

    return unsubscribe;
  }, [students]);

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
    
  const selectedStudentData = students.find(s => s.id === selectedStudentId);
  const habitsForSelectedDate = selectedStudentData ? getHabitsForDate(selectedStudentData.id, selectedDate) : [];

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
    if (!dateRange?.from || !selectedStudentData) return [];

    const from = startOfDay(dateRange.from);
    const to = dateRange.to || startOfDay(dateRange.from);
    const intervalDays = eachDayOfInterval({ start: from, end: to });
    const relevantEntries = habitEntries.filter(entry => 
      entry.studentId === selectedStudentData.id &&
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

  }, [dateRange, selectedStudentData, habitEntries]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (students.length === 0) {
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

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Dasbor Perkembangan Anak</h1>
        <p className="text-muted-foreground">Selamat datang, {userProfile?.name}. Pantau progres anak Anda di sini.</p>
      </header>

      {students.length > 1 && (
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

      {selectedStudentData ? (
        <>
            <Card>
                <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                    <CardTitle>Grafik Perkembangan Kebiasaan {selectedStudentData.name}</CardTitle>
                    <CardDescription>
                        Visualisasikan tren skor kebiasaan anak Anda pada rentang tanggal yang dipilih.
                    </CardDescription>
                    </div>
                    <DateRangePicker date={dateRange} onDateChange={setDateRange} />
                </div>
                </CardHeader>
                <CardContent>
                {entriesLoading && !chartData.length ? (
                    <div className="flex h-80 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
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
                )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                    <CardTitle>Rincian Progres Harian {selectedStudentData.name}</CardTitle>
                    <CardDescription>Pilih tanggal untuk melihat rincian progres pada hari itu.</CardDescription>
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
                {entriesLoading && habitsForSelectedDate.length === 0 ? (
                <div className="flex h-48 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
                ) : habitsForSelectedDate.length > 0 && habitsForSelectedDate.some(h => h.subHabits.some(sh => sh.score > 0)) ? (
                <div className="space-y-4">
                     {dailySummaryData.length > 0 ? (
                        <div className="bg-muted/50 p-4 rounded-lg">
                            <h4 className="font-semibold text-sm mb-2 text-center">Ringkasan Rata-Rata per Kebiasaan</h4>
                             <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={dailySummaryData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis domain={[0, 4]} allowDecimals={false} fontSize={12} tickLine={false} axisLine={false}/>
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
                    <p className="text-sm text-muted-foreground mt-1">Silakan pilih tanggal lain atau input data anak Anda.</p>
                </div>
                )}
                </CardContent>
            </Card>
        </>
      ) : (
         <div className="flex h-48 items-center justify-center">
            <p className="text-muted-foreground">Silakan pilih anak untuk melihat progres.</p>
        </div>
      )}
    </div>
  );
}
