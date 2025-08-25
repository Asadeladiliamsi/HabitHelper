import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/login-form';
import { Logo } from '@/components/icons/logo';

export default function LoginPage() {
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
            <CardTitle className="text-2xl">Selamat Datang Kembali</CardTitle>
            <CardDescription>
              Silakan masuk untuk mengakses dashboard Anda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Belum punya akun?{' '}
          <Link href="#" className="font-medium text-primary hover:underline">
            Hubungi Admin
          </Link>
        </p>
      </div>
    </div>
  );
}
