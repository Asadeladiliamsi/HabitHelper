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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


const emailLoginSchema = z.object({
  email: z.string().email({ message: 'Email tidak valid.' }),
  password: z.string().min(6, { message: 'Kata sandi minimal 6 karakter.' }),
});

const nisnLoginSchema = z.object({
    nisn: z.string().min(1, { message: 'NISN harus diisi.' }),
    password: z.string().min(6, { message: 'Kata sandi minimal 6 karakter.' }),
});

const parentLoginSchema = z.object({
  email: z.string().email({ message: 'Email tidak valid.' }),
  password: z.string().min(6, { message: 'Kata sandi minimal 6 karakter.' }),
});


type EmailLoginValues = z.infer<typeof emailLoginSchema>;
type NisnLoginValues = z.infer<typeof nisnLoginSchema>;
type ParentLoginValues = z.infer<typeof parentLoginSchema>;


export default function LoginPage() {
  const { login, loginWithNisn } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const emailForm = useForm<EmailLoginValues>({
    resolver: zodResolver(emailLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const nisnForm = useForm<NisnLoginValues>({
      resolver: zodResolver(nisnLoginSchema),
      defaultValues: {
          nisn: '',
          password: '',
      }
  })

  const parentForm = useForm<ParentLoginValues>({
    resolver: zodResolver(parentLoginSchema),
    defaultValues: {
        email: '',
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

  const onEmailSubmit = (data: EmailLoginValues) => {
    handleLogin(login(data.email, data.password));
  };

  const onNisnSubmit = (data: NisnLoginValues) => {
      handleLogin(loginWithNisn(data.nisn, data.password));
  }

  const onParentSubmit = (data: ParentLoginValues) => {
    handleLogin(login(data.email, data.password));
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Masuk</CardTitle>
        <CardDescription>Pilih peran Anda dan masukkan kredensial untuk masuk.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="guru">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="guru">Guru / Admin</TabsTrigger>
                <TabsTrigger value="siswa">Siswa</TabsTrigger>
                <TabsTrigger value="orangtua">Orang Tua</TabsTrigger>
            </TabsList>
            <div className="pt-6">
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Gagal Masuk</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
            </div>
            <TabsContent value="guru">
                 <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email-guru">Email</Label>
                        <Input id="email-guru" type="email" placeholder="email@contoh.com" {...emailForm.register('email')} />
                        {emailForm.formState.errors.email && <p className="text-sm text-destructive">{emailForm.formState.errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password-guru">Kata Sandi</Label>
                        <Input id="password-guru" type="password" placeholder="••••••••" {...emailForm.register('password')} />
                        {emailForm.formState.errors.password && <p className="text-sm text-destructive">{emailForm.formState.errors.password.message}</p>}
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Masuk sebagai Guru/Admin'}
                    </Button>
                </form>
            </TabsContent>
             <TabsContent value="siswa">
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
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Masuk sebagai Siswa'}
                    </Button>
                </form>
            </TabsContent>
             <TabsContent value="orangtua">
                <form onSubmit={parentForm.handleSubmit(onParentSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email-orangtua">Email</Label>
                        <Input id="email-orangtua" type="email" placeholder="email@contoh.com" {...parentForm.register('email')} />
                        {parentForm.formState.errors.email && <p className="text-sm text-destructive">{parentForm.formState.errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password-orangtua">Kata Sandi</Label>
                        <Input id="password-orangtua" type="password" placeholder="••••••••" {...parentForm.register('password')} />
                        {parentForm.formState.errors.password && <p className="text-sm text-destructive">{parentForm.formState.errors.password.message}</p>}
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Masuk sebagai Orang Tua'}
                    </Button>
                </form>
            </TabsContent>
        </Tabs>
       
        <div className="mt-4 text-center text-sm">
          Belum punya akun?{' '}
          <Link href="/signup" className="underline">
            Daftar
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
