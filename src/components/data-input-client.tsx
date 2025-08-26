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
import { cn } from '@/lib/utils';
import type { Student } from '@/lib/types';
import { HABIT_NAMES } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface DataInputClientProps {
  students: Student[];
}

const formSchema = z.object({
  studentId: z.string().min(1, 'Siswa harus dipilih.'),
  habitName: z.string().min(1, 'Kebiasaan harus dipilih.'),
  score: z.coerce
    .number()
    .min(1, 'Skor minimal 1.')
    .max(10, 'Skor maksimal 10.'),
  date: z.date({
    required_error: 'Tanggal harus diisi.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function DataInputClient({ students }: DataInputClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: '',
      habitName: '',
      score: 8,
      date: new Date(),
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    console.log('Data yang disubmit:', data);

    // Simulasi pemanggilan API
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsLoading(false);
    toast({
      title: 'Sukses!',
      description: `Data untuk ${data.habitName} berhasil disimpan.`,
    });
    form.reset({
      studentId: data.studentId,
      habitName: '',
      score: 8,
      date: data.date,
    });
  };

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Form Input Harian</CardTitle>
        <CardDescription>
          Pilih siswa, kebiasaan, dan masukkan skor harian beserta tanggalnya.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="studentId">Pilih Siswa</Label>
            <Controller
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id="studentId">
                    <SelectValue placeholder="Pilih nama siswa..." />
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
              <Label htmlFor="habitName">Pilih Karakter/Kebiasaan</Label>
              <Controller
                control={form.control}
                name="habitName"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="habitName">
                      <SelectValue placeholder="Pilih kebiasaan..." />
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
              {form.formState.errors.habitName && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.habitName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="score">Skor (1-10)</Label>
              <Input
                id="score"
                type="number"
                min="1"
                max="10"
                {...form.register('score')}
              />
              {form.formState.errors.score && (
                <p className="text-sm text-destructive mt-1">
                  {form.form.formState.errors.score.message}
                </p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Tanggal</Label>
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
                      {field.value ? format(field.value, 'PPP') : <span>Pilih tanggal</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {form.formState.errors.date && <p className="text-sm text-destructive mt-1">{form.formState.errors.date.message}</p>}
          </div>


          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...
              </>
            ) : (
              'Simpan Data'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
