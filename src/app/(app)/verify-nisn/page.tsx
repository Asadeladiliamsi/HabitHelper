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
import { StudentProvider } from '@/contexts/student-context';

const formSchema = z.object({
  nisn: z.string().min(1, { message: 'NISN tidak boleh kosong.' }),
});

type FormValues = z.infer<typeof formSchema>;

function VerifyNisnPageClient() {
  const { user, verifyAndLinkNisn } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nisn: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      setError('Sesi tidak ditemukan. Silakan login kembali.');
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await verifyAndLinkNisn(user.uid, data.nisn);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Verifikasi Akun Siswa</CardTitle>
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
  );
}

export default function VerifyNisnPage() {
    return (
        <StudentProvider>
            <VerifyNisnPageClient />
        </StudentProvider>
    )
}
