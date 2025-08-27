'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, AlertTriangle, Loader2 } from 'lucide-react';
import { checkHabitDecline, getRecentHabitScores } from '@/app/actions';
import { useStudent } from '@/contexts/student-context';
import { HABIT_NAMES } from '@/lib/types';
import type { HabitDeclineNotificationOutput } from '@/ai/flows/habit-decline-notification';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';
import { StudentSearchDialog } from './student-search-dialog';
import { Badge } from './ui/badge';


const formSchema = z.object({
  studentId: z.string().min(1, 'Siswa harus dipilih.'),
  habitName: z.string().min(1, 'Kebiasaan harus dipilih.'),
});

type FormValues = z.infer<typeof formSchema>;

export function NotificationsClient() {
  const { students } = useStudent();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<HabitDeclineNotificationOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchedScores, setFetchedScores] = useState<number[] | null>(null);
  const { language } = useLanguage();
  const t = translations[language]?.notificationsClient || translations.en.notificationsClient;
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: '',
      habitName: '',
    },
  });
  
  const selectedStudentName = students.find(s => s.id === form.watch('studentId'))?.name || '';


  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    setFetchedScores(null);

    // Step 1: Fetch recent scores
    const scoreResponse = await getRecentHabitScores(data.studentId, data.habitName);

    if (!scoreResponse.success || !scoreResponse.scores) {
        setError(scoreResponse.error || 'Gagal mengambil data skor.');
        setIsLoading(false);
        return;
    }
    
    setFetchedScores(scoreResponse.scores);

    // Step 2: Run AI analysis with fetched scores
    const response = await checkHabitDecline({
      studentId: data.studentId,
      habitName: data.habitName,
      habitScores: scoreResponse.scores,
    });

    if (response.success && response.data) {
      setResult(response.data);
    } else {
      setError(response.error || 'Terjadi kesalahan yang tidak diketahui.');
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="studentId">{t.student}</Label>
             <Controller
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <StudentSearchDialog
                  students={students}
                  selectedStudentId={field.value}
                  onStudentSelect={(studentId) => field.onChange(studentId)}
                  placeholder={t.selectStudentPlaceholder}
                  selectedStudentName={selectedStudentName}
                />
              )}
            />
             {form.formState.errors.studentId && <p className="text-sm text-destructive mt-1">{form.formState.errors.studentId.message}</p>}
          </div>
          <div>
            <Label htmlFor="habitName">{t.habit}</Label>
            <Controller
              control={form.control}
              name="habitName"
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id="habitName">
                    <SelectValue placeholder={t.selectHabitPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {HABIT_NAMES.map((name) => (
                      <SelectItem key={name} value={name}>
                        {habitTranslationMapping[name] || name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
             {form.formState.errors.habitName && <p className="text-sm text-destructive mt-1">{form.formState.errors.habitName.message}</p>}
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t.analyzing}
            </>
          ) : (
            t.runAnalysis
          )}
        </Button>
      </form>

       {fetchedScores && (
         <div className="p-4 border rounded-md bg-muted/50">
            <h4 className="font-semibold text-sm mb-2">Data Skor Otomatis</h4>
            <p className="text-sm text-muted-foreground">
              Sistem menemukan 3 skor terakhir untuk kebiasaan ini: <Badge variant="outline" className="mx-1">{fetchedScores[0]}</Badge> <Badge variant="outline" className="mx-1">{fetchedScores[1]}</Badge> <Badge variant="outline" className="mx-1">{fetchedScores[2]}</Badge>. Data ini digunakan untuk analisis AI.
            </p>
         </div>
       )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>{t.analysisResult}</CardTitle>
          </CardHeader>
          <CardContent>
            {result.shouldNotify ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{t.notificationNeeded}</AlertTitle>
                <AlertDescription>{result.notificationMessage}</AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>{t.noDecline}</AlertTitle>
                <AlertDescription>
                  {result.notificationMessage || t.noDeclineMessage}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
      {error && (
         <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t.error}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
      )}
    </div>
  );
}
