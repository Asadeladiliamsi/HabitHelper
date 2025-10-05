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
import { Loader2, AlertCircle } from 'lucide-react';
import { signInWithEmailAndPassword, User } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/firebase/provider';
import type { UserProfile } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


const formSchema = z.object({
  email: z.string().email({ message: 'Email tidak valid.' }),
  password: z.string().min(6, { message: 'Kata sandi minimal 6 karakter.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
            
            if (profile.role === 'admin') {
                router.replace('/admin/dashboard');
            } else if (profile.role === 'siswa') {
                const studentQuery = query(collection(db, 'students'), where('linkedUserUid', '==', user.uid));
                const studentSnapshot = await getDocs(studentQuery);

                if (studentSnapshot.empty) {
                    router.replace('/link-account');
                } else {
                    const studentData = studentSnapshot.docs[0].data();
                    if (!studentData.class) {
                        router.replace('/pilih-kelas');
                    } else {
                        router.replace('/dashboard');
                    }
                }
            } else {
                router.replace('/dashboard');
            }
        } else {
            toast({
              title: 'Profil Tidak Ditemukan',
              description: 'Profil Anda belum lengkap. Mari kita tautkan akun Anda.',
            });
            router.replace('/link-account');
        }
    } catch (e: any) {
        console.error("Error fetching user profile after login:", e);
        setErrorMessage("Gagal mengambil data profil setelah login. Pastikan Anda memiliki koneksi internet dan coba lagi.");
    }
  }

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null); // Reset error message on new submission
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      toast({
        title: 'Login Berhasil',
        description: 'Memuat data profil Anda...',
      });
      await handleLoginSuccess(userCredential.user);
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setErrorMessage('Email atau kata sandi yang Anda masukkan salah. Mohon periksa kembali kredensial Anda.');
      } else {
         setErrorMessage('Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.');
      }
    } finally {
        setIsSubmitting(false);
    }
  };
  
  useEffect(() => {
    // This effect handles redirection for users who are already logged in when they visit the page.
    if (!loading && user) {
        handleLoginSuccess(user);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user]);


  // Show loading indicator while checking auth state or if user object exists (which means we are about to redirect)
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
              aria-invalid={!!form.formState.errors.email}
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
              aria-invalid={!!form.formState.errors.password}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.password.message}</p>
            )}
          </div>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Login Gagal</AlertTitle>
              <AlertDescription>
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}
          
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
