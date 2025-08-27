'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { id, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { HABIT_NAMES } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useStudent } from '@/contexts/student-context';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';


const formSchema = z.object({
  studentId: z.string().min(1, 'Siswa harus dipilih.'),
  habitName: z.string().min(1, 'Kebiasaan harus dipilih.'),
  score: z.coerce
    .number()
    .min(1, 'Skor minimal 1.')
    .max(4, 'Skor maksimal 4.'),
  date: z.date({
    required_error: 'Tanggal harus diisi.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function DataInputClient() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { students, addHabitEntry } = useStudent();
  const { language } = useLanguage();
  const t = translations[language]?.dataInputClient || translations.en.dataInputClient;
  const tHabits = translations[language]?.landingPage.habits || translations.en.landingPage.habits;
  const locale = language === 'id' ? id : enUS;

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
      score: 4,
      date: new Date(),
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    const translatedHabitName = habitTranslationMapping[data.habitName] || data.habitName;

    try {
      await addHabitEntry({
        studentId: data.studentId,
        habitName: data.habitName,
        score: data.score,
        date: data.date,
      });

      toast({
        title: t.toast.title,
        description: `${t.toast.description1} ${translatedHabitName} ${t.toast.description2}`,
      });
      
      form.reset({
        ...form.getValues(),
        habitName: '',
        score: 4,
      });

    } catch (error) {
      console.error("Failed to save habit entry:", error);
      toast({
        variant: "destructive",
        title: "Gagal Menyimpan",
        description: "Terjadi kesalahan saat menyimpan data. Silakan coba lagi.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{t.formTitle}</CardTitle>
        <CardDescription>
          {t.formDescription}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="studentId">{t.selectStudent}</Label>
            <Controller
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="studentId">
                    <SelectValue placeholder={t.selectStudentPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} ({student.class})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.studentId && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.studentId.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="habitName">{t.selectHabit}</Label>
              <Controller
                control={form.control}
                name="habitName"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
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
              {form.formState.errors.habitName && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.habitName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="score">{t.score}</Label>
              <Input
                id="score"
                type="number"
                min="1"
                max="4"
                {...form.register('score')}
              />
              {form.formState.errors.score && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.score.message}
                </p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>{t.date}</Label>
            <Controller
              control={form.control}
              name="date"
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, 'PPP', { locale }) : <span>{t.datePlaceholder}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      locale={locale}
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {form.formState.errors.date && <p className="text-sm text-destructive mt-1">{form.formState.errors.date.message}</p>}
          </div>


          <Button type="submit" disabled={isLoading || !form.formState.isValid} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t.saving}
              </>
            ) : (
              t.saveButton
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
