'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { signInWithEmailAndPassword, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/firebase/provider';
import type { UserProfile } from '@/lib/types';


const formSchema = z.object({
  email: z.string().email({ message: 'Email tidak valid.' }),
  password: z.string().min(6, { message: 'Kata sandi minimal 6 karakter.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, loading } = useAuth();


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleLoginSuccess = async (user: User) => {
    try {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
            const profile = docSnap.data() as UserProfile;
            
            // Logika Pengalihan Cerdas Berdasarkan Peran
            if (profile.role === 'siswa') {
                // Periksa apakah siswa sudah memiliki kelas.
                const studentQuery = query(collection(db, 'students'), where('linkedUserUid', '==', user.uid));
                const studentSnapshot = await getDocs(studentQuery);

                if (!studentSnapshot.empty) {
                    const studentData = studentSnapshot.docs[0].data();
                    if (studentData.class) {
                        router.push('/dashboard');
                    } else {
                        // Jika siswa ada tapi belum punya kelas
                        router.push('/pilih-kelas');
                    }
                } else {
                    // Jika data siswa belum ada (mungkin baru daftar), arahkan ke link-account
                    router.push('/link-account');
                }
            } else if (profile.role === 'admin') {
                router.push('/admin/dashboard');
            } else {
                // Untuk guru dan orangtua
                router.push('/dashboard');
            }
        } else {
            // Profil tidak ditemukan, mungkin siswa yang baru mendaftar
            // dan datanya dibuat oleh guru. Arahkan ke halaman penautan.
            toast({
              title: 'Profil Tidak Ditemukan',
              description: 'Mengarahkan Anda untuk menautkan akun dengan data siswa.',
            });
            router.push('/link-account');
        }
    } catch (e: any) {
        console.error("Error fetching user profile after login:", e);
        toast({
            variant: "destructive",
            title: "Gagal Mengambil Profil",
            description: "Tidak dapat memuat data profil setelah login. Mengarahkan ke dasbor umum.",
        });
        // Fallback ke dasbor umum jika ada error saat fetch profil
        router.push('/dashboard');
    }
  }

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      toast({
        title: 'Login Berhasil',
        description: 'Memuat data profil Anda...',
      });
      await handleLoginSuccess(userCredential.user);
    } catch (error: any) {
      console.error(error);
      let description = 'Terjadi kesalahan. Silakan coba lagi.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        description = 'Email atau kata sandi salah. Mohon periksa kembali.';
      }
      toast({
        variant: 'destructive',
        title: 'Login Gagal',
        description,
      });
      setIsSubmitting(false);
    } 
    // isSubmitting akan tetap true saat redirect, ini tidak masalah.
  };
  
  // Jika pengguna sudah login, arahkan mereka
  useEffect(() => {
    if (!loading && user) {
        handleLoginSuccess(user);
    }
  }, [loading, user]);


  if (loading || user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }


  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Masuk</CardTitle>
        <CardDescription>
          Masukkan email dan kata sandi Anda untuk masuk.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Masuk'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Belum punya akun?{' '}
          <Link href="/signup" className="underline">
            Daftar di sini
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
