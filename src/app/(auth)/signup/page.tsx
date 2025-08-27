'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import type { UserRole } from '@/lib/types';

const formSchema = z.object({
  email: z.string().email('Email tidak valid.'),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter.'),
  role: z.enum(['guru', 'siswa', 'orangtua'], {
    required_error: 'Anda harus memilih peran.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function SignupPage() {
  const { signup, loading } = useAuth();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormValues) => {
    signup(data.email, data.password, data.role as UserRole);
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Daftar Akun</CardTitle>
        <CardDescription>
          Buat akun baru untuk mulai menggunakan HabitHelper.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" {...form.register('email')} />
            {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Kata Sandi</Label>
            <Input id="password" type="password" {...form.register('password')} />
            {form.formState.errors.password && <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Daftar sebagai</Label>
            <RadioGroup
              onValueChange={(value) => form.setValue('role', value as UserRole)}
              defaultValue={form.getValues('role')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="guru" id="guru" />
                <Label htmlFor="guru">Guru</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="siswa" id="siswa" />
                <Label htmlFor="siswa">Siswa</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="orangtua" id="orangtua" />
                <Label htmlFor="orangtua">Orang Tua</Label>
              </div>
            </RadioGroup>
            {form.formState.errors.role && <p className="text-sm text-destructive">{form.formState.errors.role.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : 'Buat Akun'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Sudah punya akun?{' '}
          <Link href="/login" className="underline">
            Login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
