'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/firebase/provider';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { doc, updateDoc, onSnapshot, query, collection, where, getDocs, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Student, ClassData } from '@/lib/types';

const PREDEFINED_KELAS_LIST = [
    "7 Ruang 1", "7 Ruang 2", "7 Ruang 3", "7 Ruang 4", "7 Ruang 5", "7 Ruang 6", "7 Ruang 7", "7 Ruang 8", "7 Ruang 9",
    "8 Ruang 1", "8 Ruang 2", "8 Ruang 3", "8 Ruang 4", "8 Ruang 5", "8 Ruang 6", "8 Ruang 7", "8 Ruang 8", "8 Ruang 9",
    "9 Ruang 1", "9 Ruang 2", "9 Ruang 3", "9 Ruang 4", "9 Ruang 5", "9 Ruang 6", "9 Ruang 7", "9 Ruang 8", "9 Ruang 9",
];

const formSchema = z.object({
  kelas: z.string().min(1, { message: 'Anda harus memilih kelas.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function PilihKelasPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const classesRef = collection(db, 'classes');
    
    const unsubClasses = onSnapshot(classesRef, (snapshot) => {
        const allFetchedClasses = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}) as ClassData);

        const unlockedClassNames = PREDEFINED_KELAS_LIST.filter(className => {
            const classDoc = allFetchedClasses.find(c => c.id === className);
            return !classDoc || !classDoc.isLocked;
        });

        setAvailableClasses(unlockedClassNames);
        setClassesLoading(false);
    }, (error) => {
        console.error("Error fetching classes: ", error);
        setClassesLoading(false);
        setAvailableClasses(PREDEFINED_KELAS_LIST); 
    });

    return () => unsubClasses();
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !userProfile) {
      router.replace('/login');
      return;
    }
    
    if (userProfile.role !== 'siswa') {
      router.replace('/dashboard');
      return;
    }
    
    setDataLoading(true);
    const studentDocRef = doc(db, 'students', user.uid);
    const unsub = onSnapshot(studentDocRef, (doc) => {
      if (doc.exists()) {
        const sData = { id: doc.id, ...doc.data() } as Student;
        setStudentData(sData);
        if (sData.class) {
          router.replace('/dashboard');
        }
      } else {
        setStudentData(null);
        toast({
            variant: "destructive",
            title: "Data Siswa Tidak Ditemukan",
            description: "Data siswa Anda tidak dapat ditemukan. Mohon hubungi admin.",
        });
        router.replace('/login');
      }
      setDataLoading(false);
    });

    return () => unsub();
  }, [user, userProfile, authLoading, router, toast]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kelas: '',
    },
  });

  const updateStudentClass = async (studentId: string, className: string) => {
    const studentDocRef = doc(db, 'students', studentId);
    await updateDoc(studentDocRef, { class: className });
  };
  
  const loading = authLoading || dataLoading || classesLoading;

  if (loading || !studentData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  const onSubmit = async (data: FormValues) => {
    if (!studentData) return;
    setIsSubmitting(true);
    try {
      await updateStudentClass(studentData.id, data.kelas);
      toast({
        title: 'Kelas Berhasil Disimpan',
        description: `Anda telah terdaftar di kelas ${data.kelas}. Mengalihkan ke dasbor...`,
      });
      // Refresh to trigger re-evaluation in /loading page
      router.refresh(); 
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Menyimpan Kelas',
        description: `Terjadi kesalahan: ${error.message}`,
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-muted">
        <Card className="mx-auto w-full max-w-lg shadow-2xl">
        <CardHeader>
            <CardTitle>Pilih Kelas Anda</CardTitle>
            <CardDescription>
            Selamat datang, {studentData?.name}! Untuk melanjutkan, silakan pilih kelas Anda dari daftar di bawah ini.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="kelas">Kelas</Label>
                <Controller
                control={form.control}
                name="kelas"
                render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="kelas">
                        <SelectValue placeholder="Pilih kelas Anda..." />
                    </SelectTrigger>
                    <SelectContent>
                        {availableClasses.map(kelas => (
                        <SelectItem key={kelas} value={kelas}>
                            {kelas}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                )}
                />
                {form.formState.errors.kelas && <p className="text-sm text-destructive mt-1">{form.formState.errors.kelas.message}</p>}
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Simpan dan Lanjutkan'}
            </Button>
            </form>
        </CardContent>
        </Card>
    </div>
  );
}
