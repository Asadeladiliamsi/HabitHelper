'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStudent } from '@/contexts/student-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import type { Habit } from '@/lib/types';

const formSchema = z.object({
  studentId: z.string().min(1, 'Siswa harus dipilih.'),
  habitId: z.string().min(1, 'Kebiasaan harus dipilih.'),
  newScore: z.number().min(1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditScoresPage() {
  const { students, updateHabitScore } = useStudent();
  const { toast } = useToast();
  const [selectedStudentHabits, setSelectedStudentHabits] = useState<Habit[]>([]);
  const [currentScore, setCurrentScore] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: '',
      habitId: '',
      newScore: 8,
    },
  });

  const selectedStudentId = form.watch('studentId');
  const selectedHabitId = form.watch('habitId');
  const newScoreValue = form.watch('newScore');

  useEffect(() => {
    if (selectedStudentId) {
      const student = students.find((s) => s.id === selectedStudentId);
      setSelectedStudentHabits(student?.habits || []);
      form.setValue('habitId', ''); 
      setCurrentScore(null);
    } else {
      setSelectedStudentHabits([]);
      setCurrentScore(null);
    }
  }, [selectedStudentId, students, form]);

  useEffect(() => {
    if (selectedHabitId && selectedStudentHabits.length > 0) {
      const habit = selectedStudentHabits.find((h) => h.id === selectedHabitId);
      const score = habit?.score || 8;
      setCurrentScore(score);
      form.setValue('newScore', score);
    } else {
      setCurrentScore(null);
    }
  }, [selectedHabitId, selectedStudentHabits, form]);
  
  const onSubmit = (data: FormValues) => {
    updateHabitScore(data.studentId, data.habitId, data.newScore);
    const student = students.find((s) => s.id === data.studentId);
    const habit = selectedStudentHabits.find((h) => h.id === data.habitId);
    toast({
      title: 'Nilai Berhasil Diperbarui!',
      description: `Nilai ${habit?.name} untuk ${student?.name} telah diubah menjadi ${data.newScore}.`,
    });
  };

  const isSliderDisabled = !selectedHabitId;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Edit Nilai Perkembangan</h1>
        <p className="text-muted-foreground">
          Ubah atau perbarui nilai perkembangan kebiasaan siswa di sini.
        </p>
      </header>
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Form Edit Nilai</CardTitle>
          <CardDescription>
            Pilih siswa, kebiasaan yang ingin diubah, lalu sesuaikan nilainya.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label>Pilih Siswa</Label>
              <Controller
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
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

            <div className="space-y-2">
              <Label>Pilih Kebiasaan</Label>
              <Controller
                control={form.control}
                name="habitId"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!selectedStudentId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kebiasaan..." />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedStudentHabits.map((habit) => (
                        <SelectItem key={habit.id} value={habit.id}>
                          {habit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.habitId && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.habitId.message}
                </p>
              )}
            </div>
            
            <div className="space-y-3">
              <Label>
                Ubah Nilai {currentScore !== null ? ` (Nilai saat ini: ${currentScore})` : ''}
              </Label>
              <div className="flex items-center gap-4">
                <Controller
                  control={form.control}
                  name="newScore"
                  render={({ field }) => (
                    <Slider
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      min={1}
                      max={10}
                      step={1}
                      className="flex-1"
                      disabled={isSliderDisabled}
                    />
                  )}
                />
                <span className="font-bold text-lg w-10 text-center">{newScoreValue}</span>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={!form.formState.isValid}>
              Simpan Perubahan
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
