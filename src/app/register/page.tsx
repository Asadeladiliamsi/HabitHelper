import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RegisterForm } from '@/components/register-form';
import { Logo } from '@/components/icons/logo';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
            <Link href="/" className="flex items-center gap-2">
                <Logo />
                <span className="font-bold text-2xl text-primary">HabitHelper</span>
            </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Buat Akun Baru</CardTitle>
            <CardDescription>
              Silakan isi form di bawah untuk mendaftar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Sudah punya akun?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
