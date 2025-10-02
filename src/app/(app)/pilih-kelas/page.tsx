'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/auth-context';
import { StudentProvider, useStudent } from '@/contexts/student-context';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

const KELAS_LIST = [
    "VII A", "VII B", "VII C", "VII D", "VII E", "VII F",
    "VIII A", "VIII B", "VIII C", "VIII D", "VIII E", "VIII F",
    "IX A", "IX B", "IX C", "IX D", "IX E", "IX F",
];

const formSchema = z.object({
  kelas: z.string().min(1, { message: 'Anda harus memilih kelas.' }),
});

type FormValues = z.infer<typeof formSchema>;

function PilihKelasForm() {
  const { userProfile, loading: authLoading } = useAuth();
  const { students, updateStudentClass, loading: studentLoading } = useStudent();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const studentData = students.find(s => s.linkedUserUid === userProfile?.uid);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kelas: '',
    },
  });

  useEffect(() => {
    // Jika siswa sudah punya kelas, arahkan ke dasbor
    if (!studentLoading && studentData && studentData.class) {
      router.replace('/dashboard');
    }
  }, [studentData, studentLoading, router]);

  if (authLoading || studentLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!studentData) {
     return (
        <Card className="mx-auto mt-10 max-w-lg">
             <CardHeader>
                <CardTitle>Data Siswa Belum Siap</CardTitle>
             </CardHeader>
             <CardContent>
                <p>Data siswa Anda belum ditambahkan oleh admin atau guru. Mohon tunggu atau hubungi pihak sekolah untuk konfirmasi.</p>
             </CardContent>
        </Card>
     )
  }

  const onSubmit = async (data: FormValues) => {
    if (!studentData) return;
    setIsLoading(true);
    try {
      await updateStudentClass(studentData.id, data.kelas);
      toast({
        title: 'Kelas Berhasil Disimpan',
        description: `Anda telah terdaftar di kelas ${data.kelas}.`,
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Menyimpan Kelas',
        description: `Terjadi kesalahan: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto mt-10 max-w-lg">
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

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Simpan dan Lanjutkan'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


export default function PilihKelasPage() {
    return (
        <StudentProvider>
            <PilihKelasForm />
        </StudentProvider>
    )
}
