'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRole } from '@/lib/types';
import { createUserProfile } from '@/services/user-service';

const formSchema = z.object({
  email: z.string().email('Email tidak valid.'),
  password: z.string().min(6, 'Password minimal 6 karakter.'),
  role: z.enum(['guru', 'siswa', 'orangtua'], {
    errorMap: () => ({ message: 'Peran harus dipilih.' }),
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async ({ email, password, role }: FormValues) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await createUserProfile(userCredential.user, role as UserRole);

      toast({
        title: 'Pendaftaran Berhasil',
        description: 'Akun Anda telah dibuat. Anda akan diarahkan ke dashboard.',
      });
      // The AuthProvider will handle the redirect.
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Pendaftaran Gagal',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Daftar Akun Baru</CardTitle>
        <CardDescription>Buat akun baru untuk mulai menggunakan HabitHelper.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="nama@email.com" {...form.register('email')} />
             {form.formState.errors.email && <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...form.register('password')} />
             {form.formState.errors.password && <p className="text-sm text-destructive mt-1">{form.formState.errors.password.message}</p>}
          </div>
           <div className="space-y-2">
            <Label htmlFor="role">Saya adalah seorang...</Label>
             <Controller
              control={form.control}
              name="role"
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Pilih peran Anda" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="guru">Guru</SelectItem>
                      <SelectItem value="siswa">Siswa</SelectItem>
                      <SelectItem value="orangtua">Orang Tua Siswa</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.role && <p className="text-sm text-destructive mt-1">{form.formState.errors.role.message}</p>}
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Daftar'}
          </Button>
        </form>
      </CardContent>
       <CardFooter className="flex flex-col gap-2 text-sm">
          <p>
              Sudah punya akun?{' '}
              <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                  Login di sini
              </Link>
          </p>
      </CardFooter>
    </Card>
  );
}
