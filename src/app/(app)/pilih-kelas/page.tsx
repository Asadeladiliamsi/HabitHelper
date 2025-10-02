'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { collection, query, where, onSnapshot, doc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Student } from '@/lib/types';


const KELAS_LIST = [
    "7 Ruang 1", "7 Ruang 2", "7 Ruang 3", "7 Ruang 4", "7 Ruang 5", "7 Ruang 6", "7 Ruang 7", "7 Ruang 8", "7 Ruang 9",
    "8 Ruang 1", "8 Ruang 2", "8 Ruang 3", "8 Ruang 4", "8 Ruang 5", "8 Ruang 6", "8 Ruang 7", "8 Ruang 8", "8 Ruang 9",
    "9 Ruang 1", "9 Ruang 2", "9 Ruang 3", "9 Ruang 4", "9 Ruang 5", "9 Ruang 6", "9 Ruang 7", "9 Ruang 8", "9 Ruang 9",
];

const formSchema = z.object({
  kelas: z.string().min(1, { message: 'Anda harus memilih kelas.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function PilihKelasPage() {
  const { user, userProfile, loading: authLoading } = useUserProfile();
  const [studentDocId, setStudentDocId] = useState<string | null>(null);
  const [studentLoading, setStudentLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Only run this logic if auth is done and we have a user profile
    if (!authLoading && userProfile) {
      // Must be a student to be on this page
      if (userProfile.role !== 'siswa' || !user) {
        router.replace('/dashboard');
        return;
      }

      setStudentLoading(true);
      const q = query(collection(db, 'students'), where('linkedUserUid', '==', user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const studentDoc = snapshot.docs[0];
          const data = studentDoc.data() as Student;
          setStudentDocId(studentDoc.id);
          // If student already has a class, they should not be on this page. Redirect them.
          if (data.class) {
            router.replace('/dashboard');
          }
        } else {
          // This case should be rare now with auto-creation, but handle it just in case
          setStudentDocId(null);
        }
        setStudentLoading(false);
      }, (error) => {
        console.error("Error fetching student data for class selection:", error);
        setStudentLoading(false);
      });
      return () => unsubscribe();
    } else if (!authLoading && !userProfile) {
        // If auth is done and there's no user, send to login
        router.replace('/login');
    }
  }, [user, userProfile, authLoading, router]);

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
  

  if (authLoading || studentLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  // This can happen if the student's account was just created and the student document
  // hasn't been created yet by the AuthProvider logic. It's a temporary state.
  if (!studentDocId) {
     return (
        <div className="flex items-center justify-center h-screen">
            <Card className="mx-auto max-w-lg">
                <CardHeader>
                    <CardTitle>Menyiapkan Akun Anda</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Data siswa Anda sedang disiapkan. Halaman akan dimuat ulang secara otomatis...</p>
                </CardContent>
            </Card>
        </div>
     )
  }

  const onSubmit = async (data: FormValues) => {
    if (!studentDocId) return;
    setIsSubmitting(true);
    try {
      await updateStudentClass(studentDocId, data.kelas);
      toast({
        title: 'Kelas Berhasil Disimpan',
        description: `Anda telah terdaftar di kelas ${data.kelas}. Mengalihkan ke dasbor...`,
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Menyimpan Kelas',
        description: `Terjadi kesalahan: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-muted">
        <Card className="mx-auto w-full max-w-lg shadow-2xl">
        <CardHeader>
            <CardTitle>Pilih Kelas Anda</CardTitle>
            <CardDescription>
            Selamat datang, {userProfile?.name}! Untuk melanjutkan, silakan pilih kelas Anda dari daftar di bawah ini.
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
                        {KELAS_LIST.map(kelas => (
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
