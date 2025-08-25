'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, AlertTriangle, Loader2 } from 'lucide-react';
import { checkHabitDecline } from '@/app/actions';
import type { Student } from '@/lib/types';
import { HABIT_NAMES } from '@/lib/types';
import type { HabitDeclineNotificationOutput } from '@/ai/flows/habit-decline-notification';

interface NotificationsClientProps {
  students: Student[];
}

const formSchema = z.object({
  studentId: z.string().min(1, 'Siswa harus dipilih.'),
  habitName: z.string().min(1, 'Kebiasaan harus dipilih.'),
  score1: z.coerce.number().min(1).max(10),
  score2: z.coerce.number().min(1).max(10),
  score3: z.coerce.number().min(1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

export function NotificationsClient({ students }: NotificationsClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<HabitDeclineNotificationOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: '',
      habitName: '',
      score1: 10,
      score2: 7,
      score3: 4,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    const response = await checkHabitDecline({
      studentId: data.studentId,
      habitName: data.habitName,
      habitScores: [data.score1, data.score2, data.score3],
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
            <Label htmlFor="studentId">Siswa</Label>
            <Controller
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id="studentId">
                    <SelectValue placeholder="Pilih Siswa" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
             {form.formState.errors.studentId && <p className="text-sm text-destructive mt-1">{form.formState.errors.studentId.message}</p>}
          </div>
          <div>
            <Label htmlFor="habitName">Kebiasaan</Label>
            <Controller
              control={form.control}
              name="habitName"
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id="habitName">
                    <SelectValue placeholder="Pilih Kebiasaan" />
                  </SelectTrigger>
                  <SelectContent>
                    {HABIT_NAMES.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
             {form.formState.errors.habitName && <p className="text-sm text-destructive mt-1">{form.formState.errors.habitName.message}</p>}
          </div>
        </div>

        <div>
          <Label>Skor 3 Hari Terakhir (1-10)</Label>
          <div className="grid grid-cols-3 gap-2 mt-1">
            <Input {...form.register('score1')} type="number" min="1" max="10" placeholder="Hari 1" />
            <Input {...form.register('score2')} type="number" min="1" max="10" placeholder="Hari 2" />
            <Input {...form.register('score3')} type="number" min="1" max="10" placeholder="Hari 3" />
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menganalisis...
            </>
          ) : (
            'Jalankan Analisis AI'
          )}
        </Button>
      </form>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Hasil Analisis AI</CardTitle>
          </CardHeader>
          <CardContent>
            {result.shouldNotify ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Notifikasi Diperlukan!</AlertTitle>
                <AlertDescription>{result.notificationMessage}</AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>Tidak Ada Penurunan Signifikan</AlertTitle>
                <AlertDescription>
                  {result.notificationMessage || 'Tidak ada notifikasi yang diperlukan saat ini. Kebiasaan siswa stabil.'}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
      {error && (
         <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
      )}
    </div>
  );
}
