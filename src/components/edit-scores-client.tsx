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
import type { Habit, Student, SubHabit } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';
import { StudentSearchDialog } from './student-search-dialog';
import { HABIT_DEFINITIONS } from '@/lib/types';


const formSchema = z.object({
  studentId: z.string().min(1, 'Siswa harus dipilih.'),
  habitName: z.string().min(1, 'Kebiasaan harus dipilih.'),
  subHabitName: z.string().min(1, 'Aspek kebiasaan harus dipilih.'),
  newScore: z.number().min(1).max(4),
});

type FormValues = z.infer<typeof formSchema>;

export function EditScoresClient() {
  const { students, updateHabitScore } = useStudent();
  const { toast } = useToast();
  const [selectedStudentData, setSelectedStudentData] = useState<Student | null>(null);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [selectedSubHabit, setSelectedSubHabit] = useState<SubHabit | null>(null);
  const [availableSubHabits, setAvailableSubHabits] = useState<string[]>([]);
  
  const { language } = useLanguage();
  const t = translations[language]?.editScoresPage || translations.en.editScoresPage;
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
      subHabitName: '',
      newScore: 4,
    },
  });

  const { watch, setValue, handleSubmit, control, formState } = form;
  const studentId = watch('studentId');
  const habitName = watch('habitName');
  const subHabitName = watch('subHabitName');
  const newScoreValue = watch('newScore');

  useEffect(() => {
    const student = students.find((s) => s.id === studentId) || null;
    setSelectedStudentData(student);
    setValue('habitName', '');
    setValue('subHabitName', '');
    setSelectedHabit(null);
    setSelectedSubHabit(null);
  }, [studentId, students, setValue]);
  
   useEffect(() => {
    const habit = selectedStudentData?.habits.find(h => h.name === habitName) || null;
    setSelectedHabit(habit);
    const subHabits = HABIT_DEFINITIONS[habitName] || [];
    setAvailableSubHabits(subHabits);
    setValue('subHabitName', '');
    setSelectedSubHabit(null);
  }, [habitName, selectedStudentData, setValue]);

  useEffect(() => {
    const subHabit = selectedHabit?.subHabits.find(sh => sh.name === subHabitName) || null;
    setSelectedSubHabit(subHabit);
    if (subHabit) {
      setValue('newScore', subHabit.score);
    } else {
      setValue('newScore', 4); // Default score if not found
    }
  }, [subHabitName, selectedHabit, setValue]);
  
  const onSubmit = (data: FormValues) => {
    if (!selectedHabit || !selectedSubHabit) {
        toast({
            variant: "destructive",
            title: "Data Tidak Lengkap",
            description: "Aspek kebiasaan yang dipilih tidak ditemukan di data siswa.",
        });
        return;
    }
    updateHabitScore(data.studentId, selectedHabit.id, selectedSubHabit.id, data.newScore);
    const student = students.find((s) => s.id === data.studentId);
    const translatedHabitName = data.habitName ? (habitTranslationMapping[data.habitName] || data.habitName) : '';
    toast({
      title: t.toast.title,
      description: `Nilai aspek '${data.subHabitName}' untuk kebiasaan '${translatedHabitName}' pada siswa ${student?.name} telah diubah menjadi ${data.newScore}.`,
    });
  };

  const isSliderDisabled = !subHabitName;

  const getScoreColor = (score: number) => {
    if (score <= 1) return 'text-red-600';
    if (score <= 3) return 'text-yellow-600';
    return 'text-green-600';
  };
  
  const selectedStudentName = students.find(s => s.id === form.watch('studentId'))?.name || '';

  return (
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Edit Nilai Aspek Kebiasaan</CardTitle>
          <CardDescription>
            Pilih siswa, kebiasaan, dan aspek spesifik yang ingin diubah, lalu sesuaikan nilainya.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label>{t.selectStudent}</Label>
              <Controller
                control={control}
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
              {formState.errors.studentId && (
                <p className="text-sm text-destructive mt-1">
                  {formState.errors.studentId.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.selectHabit}</Label>
                <Controller
                  control={control}
                  name="habitName"
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!studentId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t.selectHabitPlaceholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedStudentData?.habits.map((habit) => (
                          <SelectItem key={habit.id} value={habit.name}>
                            {habitTranslationMapping[habit.name] || habit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {formState.errors.habitName && (
                  <p className="text-sm text-destructive mt-1">
                    {formState.errors.habitName.message}
                  </p>
                )}
              </div>
               <div className="space-y-2">
                <Label>Pilih Aspek Kebiasaan</Label>
                <Controller
                  control={control}
                  name="subHabitName"
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!habitName}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih aspek..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSubHabits.map((subHabitName) => (
                          <SelectItem key={subHabitName} value={subHabitName}>
                            {subHabitName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {formState.errors.subHabitName && (
                  <p className="text-sm text-destructive mt-1">
                    {formState.errors.subHabitName.message}
                  </p>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <Label>
                {t.changeScore} {selectedSubHabit ? ` (Nilai saat ini: ${selectedSubHabit.score})` : ''}
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
                      max={4}
                      step={1}
                      className="flex-1"
                      disabled={isSliderDisabled}
                    />
                  )}
                />
                <span className={cn("font-bold text-lg w-10 text-center", getScoreColor(newScoreValue))}>
                  {newScoreValue}
                </span>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={!formState.isValid}>
              {t.saveButton}
            </Button>
          </form>
        </CardContent>
      </Card>
  );
}
