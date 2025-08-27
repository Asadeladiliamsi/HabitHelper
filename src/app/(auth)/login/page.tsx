'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';

const nisnLoginSchema = z.object({
    nisn: z.string().min(1, { message: 'NISN harus diisi.' }),
    password: z.string().min(6, { message: 'Kata sandi minimal 6 karakter.' }),
});

type NisnLoginValues = z.infer<typeof nisnLoginSchema>;

export default function LoginPage() {
  const { loginWithNisn } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const nisnForm = useForm<NisnLoginValues>({
      resolver: zodResolver(nisnLoginSchema),
      defaultValues: {
          nisn: '',
          password: '',
      }
  })

  const handleLogin = async (loginFn: Promise<any>) => {
    setIsLoading(true);
    setError(null);
    try {
      await loginFn;
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const onNisnSubmit = (data: NisnLoginValues) => {
      handleLogin(loginWithNisn(data.nisn, data.password));
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Masuk Siswa</CardTitle>
        <CardDescription>Masukkan NISN dan kata sandi Anda untuk masuk.</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
            <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Gagal Masuk</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        <form onSubmit={nisnForm.handleSubmit(onNisnSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="nisn">NISN</Label>
                <Input id="nisn" type="text" placeholder="Masukkan NISN Anda" {...nisnForm.register('nisn')} />
                {nisnForm.formState.errors.nisn && <p className="text-sm text-destructive">{nisnForm.formState.errors.nisn.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="password-siswa">Kata Sandi</Label>
                <Input id="password-siswa" type="password" placeholder="••••••••" {...nisnForm.register('password')} />
                {nisnForm.formState.errors.password && <p className="text-sm text-destructive">{nisnForm.formState.errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Masuk'}
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
