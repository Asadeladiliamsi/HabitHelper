
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
  const { userProfile } = useAuth();
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
  const studentData = students.find(s => s.email === userProfile?.email);

  if (!studentData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Siswa Belum Ditemukan</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Profil Anda belum terhubung dengan data siswa di sistem. Mohon hubungi guru Anda untuk memastikan email yang Anda gunakan untuk mendaftar sudah ditambahkan ke profil siswa oleh guru.</p>
        </CardContent>
      </Card>
    );
  }

  const averageScore = studentData.habits.reduce((acc, h) => acc + h.score, 0) / (studentData.habits.length || 1);

  return (
    <>
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Halo, {userProfile?.name}!</h1>
        <p className="text-muted-foreground">Selamat datang di dasbor pribadimu. Pantau terus perkembanganmu!</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Progres Kebiasaanmu</CardTitle>
          <CardDescription>Berikut adalah rekapitulasi nilai dari 7 kebiasaan inti yang kamu jalani.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kebiasaan</TableHead>
                <TableHead className="text-right">Nilai</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentData.habits.map((habit) => (
                <TableRow key={habit.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {habitIcons[habit.name]}
                      <span className="font-medium">{habitTranslationMapping[habit.name] || habit.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-mono text-lg font-bold">{habit.score}</span>
                  </TableCell>
                </TableRow>
              ))}
               <TableRow className="bg-muted/50 font-bold">
                  <TableCell>Rata-rata</TableCell>
                  <TableCell className="text-right">
                     <div className="flex items-center justify-end gap-2">
                        <Progress value={(averageScore / 4) * 100} className="w-24 h-2" />
                        <span className="font-mono text-sm">{averageScore.toFixed(1)}</span>
                      </div>
                  </TableCell>
                </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
