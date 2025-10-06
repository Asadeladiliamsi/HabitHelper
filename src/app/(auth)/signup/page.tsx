'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, writeBatch } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Nama lengkap diperlukan.' }),
  email: z.string().email({ message: 'Harap masukkan email yang valid.' }),
  password: z.string().min(6, { message: 'Kata sandi minimal 6 karakter.' }),
  role: z.enum(['guru', 'siswa', 'orangtua'], {
    required_error: 'Anda harus memilih peran.',
  }),
  teacherCode: z.string().optional(),
  nisn: z.string().optional(),
}).refine(data => {
    // Jika peran adalah guru, kode guru harus diisi
    if (data.role === 'guru' && !data.teacherCode) {
        return false;
    }
    return true;
}, {
    message: 'Kode registrasi guru harus diisi.',
    path: ['teacherCode'],
}).refine(data => {
    // Jika peran adalah siswa, NISN harus diisi
    if (data.role === 'siswa' && !data.nisn) {
        return false;
    }
    return true;
}, {
    message: 'NISN harus diisi untuk siswa.',
    path: ['nisn'],
});


type FormValues = z.infer<typeof formSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: undefined,
      teacherCode: '',
      nisn: ''
    },
  });
  
  const selectedRole = form.watch('role');

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
        // 1. Validasi di muka (kode guru, dll.)
        if (data.role === 'guru') {
            const settingsDocRef = doc(db, 'app_settings', 'registration');
            const settingsDoc = await getDoc(settingsDocRef);
            if (!settingsDoc.exists() || settingsDoc.data().teacherCode !== data.teacherCode) {
                setErrorMessage('Kode registrasi guru tidak valid.');
                setIsSubmitting(false);
                return;
            }
        }
        
      // 2. Buat pengguna di Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: data.name });

      // 3. Buat profil pengguna di Firestore menggunakan Batch
      const batch = writeBatch(db);
      const userDocRef = doc(db, 'users', user.uid);
      
      const userProfileData: { role: string; name: string; email: string; uid: string, nisn?: string } = {
          uid: user.uid,
          name: data.name,
          email: data.email,
          role: data.role,
      };

      if (data.role === 'siswa' && data.nisn) {
        userProfileData.nisn = data.nisn;
      }

      batch.set(userDocRef, userProfileData);

      await batch.commit();

      toast({
        title: 'Pendaftaran Berhasil!',
        description: 'Akun Anda telah dibuat. Mengalihkan ke halaman login...',
      });

      // Redirect ke halaman login setelah berhasil mendaftar
      setTimeout(() => {
          router.push('/login');
          router.refresh();
      }, 2000);

    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('Email ini sudah terdaftar. Silakan gunakan email lain atau masuk.');
      } else {
        setErrorMessage('Terjadi kesalahan saat pendaftaran. Silakan coba lagi.');
        console.error("Signup Error:", error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Buat Akun Baru</CardTitle>
        <CardDescription>
          Isi formulir di bawah ini untuk mendaftar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Saya mendaftar sebagai:</Label>
             <Controller
                name="role"
                control={form.control}
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-4 pt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="guru" id="r-guru" />
                      <Label htmlFor="r-guru">Guru</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="siswa" id="r-siswa" />
                      <Label htmlFor="r-siswa">Siswa</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                      <RadioGroupItem value="orangtua" id="r-orangtua" />
                      <Label htmlFor="r-orangtua">Orang Tua</Label>
                    </div>
                  </RadioGroup>
                )}
              />
              {form.formState.errors.role && <p className="text-sm text-destructive">{form.formState.errors.role.message}</p>}
          </div>

          {selectedRole === 'guru' && (
              <div className="space-y-2">
                <Label htmlFor="teacherCode">Kode Registrasi Guru</Label>
                <Input
                    id="teacherCode"
                    type="text"
                    placeholder="Masukkan kode dari sekolah"
                    {...form.register('teacherCode')}
                />
                {form.formState.errors.teacherCode && <p className="text-sm text-destructive">{form.formState.errors.teacherCode.message}</p>}
              </div>
          )}
           {selectedRole === 'siswa' && (
              <div className="space-y-2">
                <Label htmlFor="nisn">NISN (Nomor Induk Siswa Nasional)</Label>
                <Input
                    id="nisn"
                    type="text"
                    placeholder="Masukkan NISN Anda"
                    {...form.register('nisn')}
                />
                 {form.formState.errors.nisn && <p className="text-sm text-destructive">{form.formState.errors.nisn.message}</p>}
              </div>
          )}


          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input id="name" {...form.register('name')} />
            {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register('email')} />
            {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Kata Sandi</Label>
            <Input id="password" type="password" {...form.register('password')} />
            {form.formState.errors.password && <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>}
          </div>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Pendaftaran Gagal</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Daftar'}
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
