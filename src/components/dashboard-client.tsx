
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  ChevronDown,
} from 'lucide-react';
import type { Student, Habit } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useStudent } from '@/contexts/student-context';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import React from 'react';


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
  
  return (
    <>
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-muted-foreground">{t.welcome}</p>
      </header>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalStudents}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">{t.activeStudents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.averageEngagement}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85.2%</div>
            <p className="text-xs text-muted-foreground">{t.engagementTrend}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.monitoredHabits}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">{t.coreHabitsMonitored}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.overallHabitProgress}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">{t.habit}</TableHead>
                <TableHead className="text-center">{t.lastWeek}</TableHead>
                <TableHead>{t.thisWeek}</TableHead>
                <TableHead className="text-center w-[100px]">{t.change}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overallHabitData.map((habit) => {
                const change = habit['Minggu Ini'] - habit['Minggu Lalu'];
                const ChangeIcon = change > 0 ? ArrowUp : change < 0 ? ArrowDown : Minus;
                const changeColor = change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-muted-foreground';
                const translatedName = habitTranslationMapping[habit.name] || habit.name;

                return (
                  <Collapsible asChild key={habit.name}>
                    <>
                      <TableRow>
                        <TableCell>
                          <CollapsibleTrigger className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-3">
                              {habitIcons[habit.name]}
                              <span className="font-medium">{translatedName}</span>
                            </div>
                            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                          </CollapsibleTrigger>
                        </TableCell>
                        <TableCell className="text-center font-mono">{habit['Minggu Lalu']}%</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={habit['Minggu Ini']} className="h-2 w-24" />
                            <span className="font-mono text-sm">{habit['Minggu Ini']}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className={cn('flex items-center justify-center gap-1 font-mono text-sm', changeColor)}>
                            <ChangeIcon className="h-4 w-4" />
                            <span>{Math.abs(change)}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                      <CollapsibleContent asChild>
                        <tr className="bg-muted/50">
                          <td colSpan={4} className="p-6 text-center">
                            <p className="text-sm text-muted-foreground">
                              Detail performa kelas akan ditampilkan di sini.
                            </p>
                          </td>
                        </tr>
                      </CollapsibleContent>
                    </>
                  </Collapsible>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.individualProgress}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.student}</TableHead>
                <TableHead>{t.class}</TableHead>
                {students.length > 0 && students[0].habits?.map((habit) => {
                  const translatedHabitName = habitTranslationMapping[habit.name] || habit.name;
                  return (
                    <TableHead key={habit.id} className="text-center">
                      <div className="flex justify-center" title={translatedHabitName}>
                        {habitIcons[habit.name]}
                      </div>
                    </TableHead>
                  )
                })}
                <TableHead>{t.average}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student: Student) => {
                if (!student.habits) return null;
                const totalScore = student.habits.reduce((acc, h) => {
                    const subHabitTotal = h.subHabits.reduce((subAcc, sh) => subAcc + sh.score, 0);
                    return acc + (subHabitTotal / (h.subHabits.length || 1));
                }, 0);
                const averageScore = totalScore / (student.habits.length || 1);

                return (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={student.avatarUrl} alt={student.name} data-ai-hint="person portrait" />
                          <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{student.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{student.class}</Badge>
                    </TableCell>
                    {student.habits.map((habit: Habit) => {
                      const habitAverage = habit.subHabits.reduce((acc, sub) => acc + sub.score, 0) / (habit.subHabits.length || 1);
                      return (
                      <TableCell key={habit.id} className="text-center">
                        <span className="font-mono">{habitAverage.toFixed(1)}</span>
                      </TableCell>
                    )})}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={(averageScore / 4) * 100} className="w-24" />
                        <span className="font-mono text-sm text-muted-foreground">{averageScore.toFixed(1)}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
