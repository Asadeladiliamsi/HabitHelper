'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStudent } from '@/contexts/student-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import type { Habit } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';
import { Check, ChevronsUpDown } from 'lucide-react';

const formSchema = z.object({
  studentId: z.string().min(1, 'Siswa harus dipilih.'),
  habitId: z.string().min(1, 'Kebiasaan harus dipilih.'),
  newScore: z.number().min(1).max(4),
});

type FormValues = z.infer<typeof formSchema>;

export function EditScoresClient() {
  const { students, updateHabitScore } = useStudent();
  const { toast } = useToast();
  const [selectedStudentHabits, setSelectedStudentHabits] = useState<Habit[]>([]);
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const { language } = useLanguage();
  const t = translations[language]?.editScoresPage || translations.en.editScoresPage;
  const tHabits = translations[language]?.landingPage.habits || translations.en.landingPage.habits;

  const [openStudentCombobox, setOpenStudentCombobox] = useState(false);


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
      habitId: '',
      newScore: 4,
    },
  });

  const selectedStudentId = form.watch('studentId');
  const selectedHabitId = form.watch('habitId');
  const newScoreValue = form.watch('newScore');

  useEffect(() => {
    const studentExists = students.some((s) => s.id === selectedStudentId);

    if (selectedStudentId && studentExists) {
      const student = students.find((s) => s.id === selectedStudentId);
      setSelectedStudentHabits(student?.habits || []);
      const habitStillExists = student?.habits.some(h => h.id === form.getValues('habitId'));
      if (!habitStillExists) {
        form.setValue('habitId', '');
        setCurrentScore(null);
      }
    } else if (selectedStudentId && !studentExists) {
        form.reset({ studentId: '', habitId: '', newScore: 4 });
        setSelectedStudentHabits([]);
        setCurrentScore(null);
    } else {
      setSelectedStudentHabits([]);
      setCurrentScore(null);
    }
  }, [selectedStudentId, students, form]);

  useEffect(() => {
    if (selectedHabitId && selectedStudentHabits.length > 0) {
      const habit = selectedStudentHabits.find((h) => h.id === selectedHabitId);
      const score = habit?.score || 4;
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
    const translatedHabitName = habit ? (habitTranslationMapping[habit.name] || habit.name) : '';
    toast({
      title: t.toast.title,
      description: `${t.toast.description1} ${translatedHabitName} ${t.toast.description2} ${student?.name} ${t.toast.description3} ${data.newScore}.`,
    });
  };

  const isSliderDisabled = !selectedHabitId;

  const getScoreColor = (score: number) => {
    if (score <= 1) return 'text-red-600';
    if (score <= 3) return 'text-yellow-600';
    return 'text-green-600';
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
              <Label>{t.selectStudent}</Label>
               <Controller
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <Popover open={openStudentCombobox} onOpenChange={setOpenStudentCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openStudentCombobox}
                        className="w-full justify-between"
                      >
                        {field.value
                          ? students.find((s) => s.id === field.value)?.name
                          : t.selectStudentPlaceholder}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                       <Command
                        filter={(value, search) => {
                            const student = students.find(s => s.id === value);
                            if (student) {
                                return student.name.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
                            }
                            return 0;
                        }}
                       >
                        <CommandInput placeholder={t.selectStudentPlaceholder} />
                        <CommandList>
                          <CommandEmpty>Siswa tidak ditemukan.</CommandEmpty>
                          <CommandGroup>
                            {students.map((student) => (
                              <CommandItem
                                key={student.id}
                                value={student.id}
                                onSelect={(currentValue) => {
                                  field.onChange(currentValue === field.value ? '' : currentValue);
                                  setOpenStudentCombobox(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    field.value === student.id ? 'opacity-100' : 'opacity-0'
                                  )}
                                />
                                 {student.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              />
              {form.formState.errors.studentId && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.studentId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t.selectHabit}</Label>
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
                      <SelectValue placeholder={t.selectHabitPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedStudentHabits.map((habit) => (
                        <SelectItem key={habit.id} value={habit.id}>
                          {habitTranslationMapping[habit.name] || habit.name}
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
                {t.changeScore} {currentScore !== null ? ` (${t.currentScore}: ${currentScore})` : ''}
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

            <Button type="submit" className="w-full" disabled={!form.formState.isValid}>
              {t.saveButton}
            </Button>
          </form>
        </CardContent>
      </Card>
  );
}
