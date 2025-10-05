'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp, writeBatch } from 'firebase/firestore';
import { HABIT_DEFINITIONS } from '@/lib/types';
import type { Habit } from '@/lib/types';

const KELAS_LIST = [
    "7 Ruang 1", "7 Ruang 2", "7 Ruang 3", "7 Ruang 4", "7 Ruang 5", "7 Ruang 6", "7 Ruang 7", "7 Ruang 8", "7 Ruang 9",
    "8 Ruang 1", "8 Ruang 2", "8 Ruang 3", "8 Ruang 4", "8 Ruang 5", "8 Ruang 6", "8 Ruang 7", "8 Ruang 8", "8 Ruang 9",
    "9 Ruang 1", "9 Ruang 2", "9 Ruang 3", "9 Ruang 4", "9 Ruang 5", "9 Ruang 6", "9 Ruang 7", "9 Ruang 8", "9 Ruang 9",
];


const formSchema = z.object({
    name: z.string().min(3, { message: 'Nama minimal 3 karakter.' }),
    email: z.string().email({ message: 'Email tidak valid.' }),
    password: z.string().min(6, { message: 'Kata sandi minimal 6 karakter.' }),
    role: z.enum(['guru', 'siswa', 'orangtua'], { required_error: 'Peran harus dipilih.' }),
    teacherCode: z.string().optional(),
    nisn: z.string().optional(),
    kelas: z.string().optional(),
}).refine(data => {
    if (data.role === 'guru') {
        return !!data.teacherCode && data.teacherCode.length > 0;
    }
    return true;
}, {
    message: 'Kode registrasi guru harus diisi.',
    path: ['teacherCode'],
}).refine(data => {
    if (data.role === 'siswa') {
        return !!data.nisn && data.nisn.length > 0;
    }
    return true;
}, {
    message: 'NISN harus diisi untuk siswa.',
    path: ['nisn'],
}).refine(data => {
    if (data.role === 'siswa') {
        return !!data.kelas && data.kelas.length > 0;
    }
    return true;
}, {
    message: 'Kelas harus dipilih untuk siswa.',
    path: ['kelas'],
});


type FormValues = z.infer<typeof formSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: undefined,
      teacherCode: '',
      nisn: '',
      kelas: '',
    },
  });
  
  const role = form.watch('role');

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);

    if (data.role === 'guru') {
        const settingsDocRef = doc(db, 'app_settings', 'registration');
        const docSnap = await getDoc(settingsDocRef);
        const validCode = docSnap.exists() ? docSnap.data().teacherCode : '';
        if (!validCode || data.teacherCode !== validCode) {
            toast({
                variant: 'destructive',
                title: 'Pendaftaran Gagal',
                description: 'Kode registrasi guru tidak valid.',
            });
            setIsLoading(false);
            return;
        }
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      const batch = writeBatch(db);

      // 1. Update auth profile
      await updateProfile(user, { displayName: data.name });

      // 2. Create user profile document
      const userProfileRef = doc(db, 'users', user.uid);
      const userProfile = {
        uid: user.uid,
        email: user.email,
        name: data.name,
        role: data.role,
        nisn: data.nisn || '',
      };
      batch.set(userProfileRef, userProfile);

      // 3. If role is 'siswa', create student data document
      if (data.role === 'siswa' && data.nisn && data.kelas) {
        const studentsCollectionRef = collection(db, 'students');
        const newStudentDocRef = doc(studentsCollectionRef); // Create a new doc with a generated ID

        const initialHabits: Habit[] = Object.entries(HABIT_DEFINITIONS).map(([habitName, subHabitNames], habitIndex) => ({
          id: `${habitIndex + 1}`,
          name: habitName,
          subHabits: subHabitNames.map((subHabitName, subHabitIndex) => ({
            id: `${habitIndex + 1}-${subHabitIndex + 1}`,
            name: subHabitName,
            score: 0,
          })),
        }));

        batch.set(newStudentDocRef, {
          name: data.name,
          nisn: data.nisn,
          class: data.kelas,
          email: data.email,
          linkedUserUid: user.uid,
          avatarUrl: `https://avatar.vercel.sh/${data.nisn}.png`,
          habits: initialHabits,
          lockedDates: [],
          createdAt: serverTimestamp(),
        });
      }
      
      await batch.commit();
      
      toast({
        title: 'Pendaftaran Berhasil',
        description: 'Akun Anda telah dibuat. Anda akan diarahkan ke dasbor.',
      });

      router.push('/dashboard');

    } catch (error: any) {
      console.error(error);
      let description = 'Terjadi kesalahan. Silakan coba lagi.';
      if (error.code === 'auth/email-already-in-use') {
        description = 'Email ini sudah terdaftar. Silakan gunakan email lain atau masuk.';
      }
      toast({
        variant: 'destructive',
        title: 'Pendaftaran Gagal',
        description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Daftar Akun Baru</CardTitle>
        <CardDescription>
          Isi form di bawah ini untuk membuat akun baru.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
           <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Kata Sandi</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...form.register('password')}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Saya mendaftar sebagai</Label>
            <Controller
                control={form.control}
                name="role"
                render={({ field }) => (
                     <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="role">
                            <SelectValue placeholder="Pilih peran Anda..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="guru">Guru</SelectItem>
                            <SelectItem value="siswa">Siswa</SelectItem>
                            <SelectItem value="orangtua">Orang Tua</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            />
            {form.formState.errors.role && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.role.message}</p>
            )}
          </div>

          {role === 'guru' && (
            <div className="space-y-2">
                <Label htmlFor="teacherCode">Kode Registrasi Guru</Label>
                <Input
                id="teacherCode"
                type="text"
                placeholder="Masukkan kode rahasia"
                {...form.register('teacherCode')}
                />
                {form.formState.errors.teacherCode && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.teacherCode.message}</p>
                )}
            </div>
          )}

          {role === 'siswa' && (
            <>
                <div className="space-y-2">
                    <Label htmlFor="nisn">NISN (Nomor Induk Siswa Nasional)</Label>
                    <Input
                    id="nisn"
                    type="text"
                    placeholder="Masukkan NISN Anda"
                    {...form.register('nisn')}
                    />
                    {form.formState.errors.nisn && (
                        <p className="text-sm text-destructive mt-1">{form.formState.errors.nisn.message}</p>
                    )}
                </div>
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
            </>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Daftar'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Sudah punya akun?{' '}
          <Link href="/login" className="underline">
            Masuk di sini
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
