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
import { AlertTriangle, Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserRole } from '@/lib/types';


const formSchema = z.object({
  name: z.string().min(3, { message: 'Nama minimal 3 karakter.' }),
  email: z.string().email({ message: 'Email tidak valid.' }),
  password: z.string().min(6, { message: 'Kata sandi minimal 6 karakter.' }),
  role: z.enum(['guru', 'siswa', 'orangtua']),
  nisn: z.string().optional(),
}).refine(data => data.role !== 'siswa' || (data.nisn && data.nisn.length > 0), {
    message: 'NISN wajib diisi jika Anda mendaftar sebagai siswa.',
    path: ['nisn'],
});


type FormValues = z.infer<typeof formSchema>;

export default function SignupPage() {
  const { signupAndCreateProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      await signupAndCreateProfile(data);
      
      toast({
          title: 'Pendaftaran Berhasil',
          description: 'Akun Anda telah dibuat. Silakan masuk menggunakan email dan kata sandi Anda.',
      });
      router.push('/login'); 
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
        <CardDescription>Daftar untuk mulai menggunakan Kaih.Spensa id.</CardDescription>
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
             <div className="relative">
              <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Minimal 6 karakter" {...form.register('password')} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.formState.errors.password && <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>}
          </div>

           <div className="space-y-2">
            <Label htmlFor="role">Saya adalah</Label>
            <Select onValueChange={(value) => form.setValue('role', value as UserRole)} defaultValue={selectedRole}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Pilih peran Anda..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="siswa">Siswa</SelectItem>
                <SelectItem value="guru">Guru</SelectItem>
                <SelectItem value="orangtua">Orang Tua</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedRole === 'siswa' && (
            <div className="space-y-2">
                <Label htmlFor="nisn">NISN (Nomor Induk Siswa Nasional)</Label>
                <Input id="nisn" type="text" placeholder="Masukkan NISN Anda" {...form.register('nisn')} />
                {form.formState.errors.nisn && <p className="text-sm text-destructive">{form.formState.errors.nisn.message}</p>}
            </div>
          )}
          
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
