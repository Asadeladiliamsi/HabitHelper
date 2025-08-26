'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { mockStudents, overallHabitData } from '@/lib/mock-data';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Zap,
  Target,
  ListChecks,
  Handshake,
  Ear,
  Combine,
  HeartPulse,
  Users,
  TrendingUp,
  Activity,
} from 'lucide-react';
import type { Student, Habit } from '@/lib/types';

const habitIcons: { [key: string]: React.ReactNode } = {
  'Proaktif': <Zap className="h-5 w-5 text-yellow-500" />,
  'Mulai dengan Tujuan Akhir': <Target className="h-5 w-5 text-red-500" />,
  'Dahulukan yang Utama': <ListChecks className="h-5 w-5 text-blue-500" />,
  'Berpikir Menang-Menang': <Handshake className="h-5 w-5 text-green-500" />,
  'Berusaha Mengerti Dahulu, Baru Dimengerti': <Ear className="h-5 w-5 text-purple-500" />,
  'Wujudkan Sinergi': <Combine className="h-5 w-5 text-orange-500" />,
  'Asah Gergaji': <HeartPulse className="h-5 w-5 text-pink-500" />,
};

const chartConfig = {
  'Minggu Ini': {
    label: 'Minggu Ini',
    color: 'hsl(var(--accent))',
  },
  'Minggu Lalu': {
    label: 'Minggu Lalu',
    color: 'hsl(var(--primary))',
  },
};

export default function GuruDashboardPage() {
  
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Guru</h1>
        <p className="text-muted-foreground">Selamat datang kembali, Guru!</p>
      </header>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStudents.length}</div>
            <p className="text-xs text-muted-foreground">Siswa aktif terpantau</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Keterlibatan Rata-rata</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85.2%</div>
            <p className="text-xs text-muted-foreground">+3.1% dari minggu lalu</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kebiasaan Terpantau</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">Kebiasaan inti dipantau</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perkembangan Kebiasaan Umum</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <BarChart accessibilityLayer data={overallHabitData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="Minggu Lalu" fill="var(--color-Minggu Lalu)" radius={4} />
              <Bar dataKey="Minggu Ini" fill="var(--color-Minggu Ini)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Progress Individu Siswa</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Siswa</TableHead>
                <TableHead>Kelas</TableHead>
                {mockStudents[0].habits.map((habit) => (
                  <TableHead key={habit.id} className="text-center">
                    <div className="flex justify-center">{habitIcons[habit.name]}</div>
                  </TableHead>
                ))}
                <TableHead>Rata-rata</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockStudents.map((student: Student) => {
                const averageScore = student.habits.reduce((acc, h) => acc + h.score, 0) / student.habits.length;
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
                        <Progress value={averageScore * 10} className="w-24" />
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
    </div>
  );
}
