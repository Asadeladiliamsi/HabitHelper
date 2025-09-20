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
  ChevronDown
} from 'lucide-react';
import type { Student, Habit } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useStudent } from '@/contexts/student-context';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


const habitIcons: { [key: string]: React.ReactNode } = {
  'Bangun Pagi': <Sunrise className="h-5 w-5 text-yellow-500" />,
  'Taat Beribadah': <Church className="h-5 w-5 text-purple-500" />,
  'Rajin Olahraga': <HeartPulse className="h-5 w-5 text-red-500" />,
  'Makan Sehat & Bergizi': <Utensils className="h-5 w-5 text-green-500" />,
  'Gemar Belajar': <BookOpen className="h-5 w-5 text-blue-500" />,
  'Bermasyarakat': <HandHelping className="h-5 w-5 text-orange-500" />,
  'Tidur Cepat': <Bed className="h-5 w-5 text-indigo-500" />,
};

// Mock data for class details
const classDetailsData: Record<string, { className: string; score: number; trend: number }[]> = {
    'Bangun Pagi': [
        { className: 'IX A', score: 90, trend: 5 },
        { className: 'IX B', score: 85, trend: -2 },
        { className: 'IX C', score: 88, trend: 3 },
    ],
    'Taat Beribadah': [
        { className: 'IX A', score: 95, trend: 2 },
        { className: 'IX B', score: 90, trend: 1 },
        { className: 'IX C', score: 89, trend: -1 },
    ],
    'Rajin Olahraga': [
        { className: 'IX A', score: 82, trend: -5 },
        { className: 'IX B', score: 88, trend: 1 },
        { className: 'IX C', score: 85, trend: -3 },
    ],
    'Makan Sehat & Bergizi': [
        { className: 'IX A', score: 96, trend: 4 },
        { className: 'IX B', score: 94, trend: 3 },
        { className: 'IX C', score: 95, trend: 5 },
    ],
    'Gemar Belajar': [
        { className: 'IX A', score: 92, trend: 4 },
        { className: 'IX B', score: 88, trend: 5 },
        { className: 'IX C', score: 87, trend: 3 },
    ],
    'Bermasyarakat': [
        { className: 'IX A', score: 90, trend: -3 },
        { className: 'IX B', score: 94, trend: 2 },
        { className: 'IX C', score: 89, trend: -1 },
    ],
    'Tidur Cepat': [
        { className: 'IX A', score: 85, trend: -4 },
        { className: 'IX B', score: 90, trend: 1 },
        { className: 'IX C', score: 86, trend: -2 },
    ],
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
          <Accordion type="single" collapsible className="w-full" asChild>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">{t.habit}</TableHead>
                  <TableHead className="text-center">{t.lastWeek}</TableHead>
                  <TableHead>{t.thisWeek}</TableHead>
                  <TableHead className="text-center w-[100px]">{t.change}</TableHead>
                  <TableHead className="w-[48px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overallHabitData.map((habit) => {
                  const change = habit['Minggu Ini'] - habit['Minggu Lalu'];
                  const ChangeIcon = change > 0 ? ArrowUp : change < 0 ? ArrowDown : Minus;
                  const changeColor = change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-muted-foreground';
                  const translatedName = habitTranslationMapping[habit.name] || habit.name;

                  return (
                    <AccordionItem value={habit.name} key={habit.name}>
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {habitIcons[habit.name]}
                            <span className="font-medium">{translatedName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-mono">{habit['Minggu Lalu']}%</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={habit['Minggu Ini']} className="w-24 h-2" />
                            <span className="font-mono text-sm">{habit['Minggu Ini']}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className={cn("flex items-center justify-center gap-1 font-mono text-sm", changeColor)}>
                            <ChangeIcon className="h-4 w-4" />
                            <span>{Math.abs(change)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-1 text-right">
                          <AccordionTrigger>
                            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 text-muted-foreground" />
                          </AccordionTrigger>
                        </TableCell>
                      </TableRow>
                      <AccordionContent asChild>
                        <TableRow>
                          <TableCell colSpan={5} className="p-0">
                            <div className="bg-muted/50 p-4">
                              <h4 className="font-semibold text-sm mb-2 ml-2">Detail Performa per Kelas</h4>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Kelas</TableHead>
                                    <TableHead>Skor Rata-rata</TableHead>
                                    <TableHead className="text-right">Tren Mingguan</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {classDetailsData[habit.name]?.map(detail => {
                                    const TrendIcon = detail.trend > 0 ? ArrowUp : detail.trend < 0 ? ArrowDown : Minus;
                                    const trendColor = detail.trend > 0 ? 'text-green-600' : detail.trend < 0 ? 'text-red-600' : 'text-muted-foreground';
                                    return (
                                      <TableRow key={detail.className} className="border-muted bg-transparent hover:bg-muted/60">
                                        <TableCell><Badge variant="secondary">{detail.className}</Badge></TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-2">
                                            <Progress value={detail.score} className="w-20 h-1.5" />
                                            <span className="font-mono text-xs">{detail.score}</span>
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <div className={cn("flex items-center justify-end gap-1 font-mono text-xs", trendColor)}>
                                            <TrendIcon className="h-3 w-3" />
                                            <span>{Math.abs(detail.trend)}%</span>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    )
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          </TableCell>
                        </TableRow>
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </TableBody>
            </Table>
          </Accordion>
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
                {students.length > 0 && students[0].habits.map((habit) => {
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
                const averageScore = student.habits.reduce((acc, h) => acc + h.score, 0) / (student.habits.length || 1);
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
                    {student.habits.map((habit: Habit) => (
                      <TableCell key={habit.id} className="text-center">
                        <span className="font-mono">{habit.score}</span>
                      </TableCell>
                    ))}
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
