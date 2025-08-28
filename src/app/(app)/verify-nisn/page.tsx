'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Logo } from '@/components/icons/logo';
import Link from 'next/link';

const formSchema = z.object({
  nisn: z.string().min(1, { message: 'NISN tidak boleh kosong.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function VerifyNisnPage() {
  const { verifyAndLinkNisn, userProfile, loading, user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // This effect ensures that only unverified students can access this page.
    if (!loading) {
      if (!user) {
        // Not logged in, send to login
        router.replace('/login');
      } else if (userProfile?.role !== 'siswa') {
        // Not a student, send to their default dashboard
        router.replace('/dashboard');
      } else if (userProfile.nisn) {
        // Student is already verified, send to dashboard
        router.replace('/dashboard');
      }
      // If none of the above, they are an unverified student and should stay here.
    }
  }, [loading, user, userProfile, router]);


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nisn: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await verifyAndLinkNisn(data.nisn);
      if (!result.success) {
        throw new Error(result.message);
      }
      // On success, the auth context's useEffect will automatically redirect
      // to the dashboard because userProfile.nisn will now exist.
      // We can also add an explicit push here for faster navigation.
      router.push('/dashboard');

    } catch (err: any) {
      setError(err.message || 'Gagal melakukan verifikasi. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Show a loading spinner while the auth state is being determined.
  // This prevents the form from flashing for users who should be redirected.
  if (loading || !userProfile || userProfile.role !== 'siswa' || userProfile.nisn) {
      return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
     <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
            <Link href="/" className="flex items-center gap-2">
                <Logo />
                <span className="font-bold text-xl text-primary">HabitHelper</span>
            </Link>
        </div>
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Verifikasi Akun, {userProfile.name}</CardTitle>
            <CardDescription>
              Masukkan Nomor Induk Siswa Nasional (NISN) Anda untuk menghubungkan akun Anda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Verifikasi Gagal</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nisn">NISN</Label>
                <Input
                  id="nisn"
                  type="text"
                  placeholder="Masukkan NISN Anda"
                  {...form.register('nisn')}
                />
                {form.formState.errors.nisn && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.nisn.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  'Verifikasi & Lanjutkan'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
