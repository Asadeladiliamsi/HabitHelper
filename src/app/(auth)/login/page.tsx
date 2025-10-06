'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  email: z.string().email({ message: 'Harap masukkan email yang valid.' }),
  password: z.string().min(1, { message: 'Kata sandi tidak boleh kosong.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast({
        title: 'Login Berhasil',
        description: 'Mengarahkan ke aplikasi...',
      });
      // Redirect to a central loading/routing page
      router.push('/loading');
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setErrorMessage('Email atau kata sandi yang Anda masukkan salah. Mohon periksa kembali.');
      } else {
        setErrorMessage('Terjadi kesalahan yang tidak diketahui. Silakan coba lagi nanti.');
        console.error(error);
      }
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Masuk ke Akun Anda</CardTitle>
        <CardDescription>
          Masukkan email dan kata sandi Anda untuk melanjutkan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@contoh.com"
              {...form.register('email')}
              disabled={isSubmitting}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Kata Sandi</Label>
            <Input
              id="password"
              type="password"
              {...form.register('password')}
              disabled={isSubmitting}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Login Gagal</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
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
