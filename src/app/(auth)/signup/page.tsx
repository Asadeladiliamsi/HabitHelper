'use client';

import { useForm, Controller } from 'react-hook-form';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';


const formSchema = z.object({
  name: z.string().min(3, { message: 'Nama minimal 3 karakter.' }),
  email: z.string().email({ message: 'Email tidak valid.' }),
  password: z.string().min(6, { message: 'Kata sandi minimal 6 karakter.' }),
  role: z.enum(['guru', 'siswa', 'orangtua'], {
    required_error: 'Anda harus memilih peran.',
  }),
  nisn: z.string().optional(),
}).refine(data => {
    // Make NISN required only if the role is 'siswa'
    if (data.role === 'siswa') {
      return !!data.nisn && data.nisn.length > 0;
    }
    return true;
}, {
    message: 'NISN harus diisi untuk siswa.',
    path: ['nisn'],
});

type FormValues = z.infer<typeof formSchema>;

export default function SignupPage() {
  const { signup, createUserProfile } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'siswa',
      nisn: '',
    },
  });

  const selectedRole = form.watch('role');

  const onSubmit = async (data: FormValues) => {
    setError(null);
    setIsLoading(true);
    try {
      const userCredential = await signup(data.email, data.password);
      await createUserProfile(userCredential.user, data.name, data.role, data.nisn);
      router.push('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email ini sudah terdaftar. Silakan gunakan email lain atau masuk.');
      } else {
        console.error(err);
        setError(`Gagal mendaftar: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Buat Akun</CardTitle>
        <CardDescription>Daftar untuk mulai menggunakan HabitHelper.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Gagal Mendaftar</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input id="name" type="text" placeholder="Nama Anda" {...form.register('name')} />
            {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="email@contoh.com" {...form.register('email')} />
            {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Kata Sandi</Label>
            <Input id="password" type="password" placeholder="••••••••" {...form.register('password')} />
            {form.formState.errors.password && <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>}
          </div>
          
           <div className="space-y-2">
            <Label>Daftar sebagai</Label>
            <Controller
              control={form.control}
              name="role"
              render={({ field }) => (
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-3 gap-4"
                >
                  <div>
                    <RadioGroupItem value="guru" id="guru" className="peer sr-only" />
                    <Label htmlFor="guru" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                      Guru
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="siswa" id="siswa" className="peer sr-only" />
                    <Label htmlFor="siswa" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                      Siswa
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="orangtua" id="orangtua" className="peer sr-only" />
                    <Label htmlFor="orangtua" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                      Orang Tua
                    </Label>
                  </div>
                </RadioGroup>
              )}
            />
            {form.formState.errors.role && <p className="text-sm text-destructive mt-2">{form.formState.errors.role.message}</p>}
          </div>

          <div className={cn("space-y-2 transition-all duration-300", selectedRole === 'siswa' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 overflow-hidden')}>
              <Label htmlFor="nisn">NISN (Nomor Induk Siswa Nasional)</Label>
              <Input id="nisn" type="text" placeholder="Masukkan NISN Anda" {...form.register('nisn')} />
              {form.formState.errors.nisn && <p className="text-sm text-destructive">{form.formState.errors.nisn.message}</p>}
          </div>


          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : 'Daftar'}
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
