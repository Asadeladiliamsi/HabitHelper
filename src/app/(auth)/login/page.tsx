'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase/provider';
import { auth } from '@/lib/firebase';
import { EmailAuthProvider } from 'firebase/auth';
import { StyledFirebaseAuth } from '@/components/firebase-auth';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Konfigurasi FirebaseUI
const uiConfig = {
  signInFlow: 'popup',
  signInSuccessUrl: '/dashboard',
  signInOptions: [
    {
      provider: EmailAuthProvider.PROVIDER_ID,
      requireDisplayName: false, // Ini akan selalu menampilkan form login terlebih dahulu
    }
  ],
  callbacks: {
    // Hindari pengalihan otomatis, biarkan signInSuccessUrl yang menangani
    signInSuccessWithAuthResult: () => true,
  },
};

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (user) {
    router.replace('/dashboard');
    return (
       <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
        <p className="ml-4">Mengalihkan ke dasbor...</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Masuk ke Akun Anda</CardTitle>
        <CardDescription>
          Gunakan email Anda untuk melanjutkan ke aplikasi.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />
      </CardContent>
    </Card>
  );
}
