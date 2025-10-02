'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/firebase';
import { EmailAuthProvider } from 'firebase/auth';
import { StyledFirebaseAuth } from '@/components/firebase-auth';
import { useUserProfile } from '@/hooks/use-user-profile';

const uiConfig = {
  signInFlow: 'popup',
  signInOptions: [
    EmailAuthProvider.PROVIDER_ID,
  ],
  callbacks: {
    signInSuccessWithAuthResult: () => false,
  },
};

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useUserProfile();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);


  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Masuk atau Daftar</CardTitle>
        <CardDescription>
          Gunakan email Anda untuk melanjutkan ke Kaih.Spensa id
        </CardDescription>
      </CardHeader>
      <CardContent>
         <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />
      </CardContent>
    </Card>
  );
}
