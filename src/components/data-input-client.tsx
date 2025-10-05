'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { HABIT_DEFINITIONS } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { translations } from '@/lib/translations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StudentSearchDialog } from './student-search-dialog';
import { useAuth } from '@/firebase';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { collection, addDoc, serverTimestamp, onSnapshot, query, getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Student, UserProfile } from '@/lib/types';

const formSchema = z.object({
  studentId: z.string().min(1, 'Siswa harus dipilih.'),
  habitName: z.string().min(1, 'Kebiasaan harus dipilih.'),
  subHabitName: z.string().min(1, 'Aspek kebiasaan harus dipilih.'),
  score: z.coerce
    .number()
    .min(1, 'Skor minimal 1.')
    .max(4, 'Skor maksimal 4.'),
  date: z.date({
    required_error: 'Tanggal harus diisi.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface DataInputClientProps {
  studentId?: string;
  allowedHabits?: string[];
}

export function DataInputClient({ studentId: lockedStudentId, allowedHabits }: DataInputClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);


  const language = 'id';
  const t = translations[language]?.dataInputClient || translations.en.dataInputClient;
  const tHabits = translations[language]?.landingPage.habits || translations.en.landingPage.habits;
  const locale = language === 'id' ? id : enUS;

  useEffect(() => {
    if (user) {
      const unsub = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          setUserProfile(doc.data() as UserProfile);
        }
      });
      return () => unsub();
    }
  }, [user]);

  useEffect(() => {
    if (lockedStudentId) {
      setStudentsLoading(false);
      return;
    }
    setStudentsLoading(true);
    const q = query(collection(db, 'students'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const studentData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
      setStudents(studentData);
      setStudentsLoading(false);
    }, (error) => {
      console.error("Failed to fetch students:", error);
      setStudentsLoading(false);
    });
    return () => unsubscribe();
  }, [lockedStudentId]);

  const isStudentRole = userProfile?.role === 'siswa';
  const isParentRole = userProfile?.role === 'orangtua';
  
  const HABIT_NAMES = Object.keys(HABIT_DEFINITIONS);
  const habitsToShow = allowedHabits ? HABIT_NAMES.filter(h => allowedHabits.includes(h)) : HABIT_NAMES;
  
  const [availableSubHabits, setAvailableSubHabits] = useState<string[]>([]);
  
  const [studentForLockCheck, setStudentForLockCheck] = useState<Student | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: lockedStudentId || '',
      habitName: '',
      subHabitName: '',
      score: 4,
      date: new Date(),
    },
  });
  
  const selectedHabitName = form.watch('habitName');
  const selectedDate = form.watch('date');
  const studentIdToWatch = form.watch('studentId');

  // Effect to fetch the specific student for lock checking
  useEffect(() => {
    if (studentIdToWatch) {
      const unsub = onSnapshot(doc(db, 'students', studentIdToWatch), (doc) => {
        if (doc.exists()) {
          setStudentForLockCheck({ id: doc.id, ...doc.data() } as Student);
        } else {
          setStudentForLockCheck(null);
        }
      });
      return () => unsub();
    } else {
      setStudentForLockCheck(null);
    }
  }, [studentIdToWatch]);
  
  const isDateLocked = useMemo(() => {
    if (!studentForLockCheck || !selectedDate) return false;
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    return studentForLockCheck.lockedDates?.includes(formattedDate) || false;
  }, [studentForLockCheck, selectedDate]);


  useEffect(() => {
    if (selectedHabitName) {
        setAvailableSubHabits(HABIT_DEFINITIONS[selectedHabitName] || []);
        form.setValue('subHabitName', '');
    } else {
        setAvailableSubHabits([]);
    }
  }, [selectedHabitName, form]);

  useEffect(() => {
    if (lockedStudentId) {
      form.setValue('studentId', lockedStudentId);
    }
  }, [lockedStudentId, form]);

  const addHabitEntry = async (data: Omit<FormValues, 'id' | 'timestamp' | 'recordedBy'>) => {
    if (!user) throw new Error("Authentication required.");
    await addDoc(collection(db, 'habit_entries'), {
      ...data,
      recordedBy: user.uid,
      timestamp: serverTimestamp()
    });
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    const selectedStudent = students.find(s => s.id === data.studentId) || studentForLockCheck;
    const studentName = selectedStudent?.name || 'Siswa';
    const translatedHabitName = habitTranslationMapping[data.habitName] || data.habitName;

    try {
      await addHabitEntry(data);

      toast({
        title: t.toast.title,
        description: `Skor untuk aspek '${data.subHabitName}' pada kebiasaan '${translatedHabitName}' untuk ${studentName} berhasil disimpan.`,
      });
      
      form.reset({
        ...form.getValues(),
        subHabitName: '',
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
  
  const selectedStudentName = students.find(s => s.id === form.watch('studentId'))?.name || studentForLockCheck?.name || '';
  
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
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Input Nilai Aspek Kebiasaan</CardTitle>
        <CardDescription>
          {isStudentRole && "Pilih kebiasaan, aspek, masukkan skor dan tanggal progres harianmu."}
          {isParentRole && "Pilih kebiasaan yang Anda pantau, aspek, masukkan skor dan tanggal."}
          {!isStudentRole && !isParentRole && "Pilih siswa, kebiasaan, aspek spesifik, dan masukkan skor harian beserta tanggalnya."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {studentsLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            {isDateLocked && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Data Terkunci</AlertTitle>
                    <AlertDescription>
                      Input untuk tanggal ini telah dikunci oleh guru dan tidak dapat diubah atau ditambahkan.
                    </AlertDescription>
                </Alert>
            )}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <fieldset disabled={isDateLocked || isLoading} className="space-y-6">
                {!lockedStudentId && (
                  <div className="space-y-2">
                    <Label htmlFor="studentId">{t.selectStudent}</Label>
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
                    {form.formState.errors.studentId && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.studentId.message}
                      </p>
                    )}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              {habitsToShow.map((name) => (
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
                        <Label htmlFor="subHabitName">Aspek Kebiasaan</Label>
                        <Controller
                            control={form.control}
                            name="subHabitName"
                            render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value} disabled={!selectedHabitName}>
                                <SelectTrigger id="subHabitName">
                                <SelectValue placeholder="Pilih aspek..." />
                                </SelectTrigger>
                                <SelectContent>
                                {availableSubHabits.map((name) => (
                                    <SelectItem key={name} value={name}>
                                    {name}
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            )}
                        />
                        {form.formState.errors.subHabitName && (
                            <p className="text-sm text-destructive mt-1">
                            {form.formState.errors.subHabitName.message}
                            </p>
                        )}
                    </div>
                </div>
                

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="score">{t.score}</Label>
                      <Controller
                          control={form.control}
                          name="score"
                          render={({ field }) => (
                              <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value)}>
                                  <SelectTrigger id="score">
                                      <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                      {[4, 3, 2, 1].map((score) => (
                                          <SelectItem key={score} value={String(score)}>
                                              {score}
                                          </SelectItem>
                                      ))}
                                  </SelectContent>
                              </Select>
                          )}
                      />
                    {form.formState.errors.score && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.score.message}
                      </p>
                    )}
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
                </div>
                <Button type="submit" disabled={isDateLocked || isLoading || !form.formState.isValid} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t.saving}
                    </>
                  ) : (
                    t.saveButton
                  )}
                </Button>
              </fieldset>
            </form>
          </>
        )}
      </CardContent>
    </Card>
  );
}
