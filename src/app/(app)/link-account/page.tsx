'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase/provider';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot, writeBatch } from 'firebase/firestore';
import type { UserProfile, Student } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function LinkAccountPage() {
  const { user, loading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<'loading' | 'linking' | 'success' | 'no_match' | 'already_linked' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const performLinking = useCallback(async (profile: UserProfile) => {
    if (!profile.nisn) {
      setErrorMessage('Profil Anda tidak memiliki NISN. Mohon lengkapi profil Anda atau hubungi admin.');
      setStatus('error');
      return;
    }

    setStatus('linking');

    try {
      // Cari data siswa berdasarkan NISN
      const studentsRef = collection(db, 'students');
      const q = query(studentsRef, where('nisn', '==', profile.nisn));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setStatus('no_match');
        return;
      }

      const studentDoc = querySnapshot.docs[0];
      const studentData = studentDoc.data() as Student;

      if (studentData.linkedUserUid && studentData.linkedUserUid !== profile.uid) {
        setStatus('already_linked');
        return;
      }

      // Lakukan penautan
      const studentDocRef = doc(db, 'students', studentDoc.id);
      await updateDoc(studentDocRef, { 
        linkedUserUid: profile.uid,
        email: profile.email,
        name: profile.name,
       });

      setStatus('success');
      
      // Tunggu sebentar lalu redirect
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 2000);

    } catch (err: any) {
      console.error('Error during linking:', err);
      setErrorMessage(err.message || 'Terjadi kesalahan yang tidak diketahui.');
      setStatus('error');
    }
  }, [router]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }

    const unsub = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        const profile = doc.data() as UserProfile;
        setUserProfile(profile);
        // Langsung mulai proses penautan
        performLinking(profile);
      } else {
        setErrorMessage('Profil pengguna tidak ditemukan.');
        setStatus('error');
      }
    });

    return () => unsub();
  }, [user, authLoading, router, performLinking]);

  const renderStatus = () => {
    switch (status) {
      case 'linking':
        return (
          <>
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="mt-4 text-muted-foreground">Mencari data siswa dengan NISN: {userProfile?.nisn}...</p>
            <p className="mt-1 text-muted-foreground">Menautkan akun Anda...</p>
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="h-12 w-12 text-green-500" />
            <p className="mt-4 text-foreground">Akun berhasil ditautkan!</p>
            <p className="mt-1 text-muted-foreground">Anda akan diarahkan ke dasbor secara otomatis...</p>
          </>
        );
      case 'no_match':
        return (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Data Siswa Tidak Ditemukan</AlertTitle>
            <AlertDescription>
              Kami tidak dapat menemukan data siswa yang cocok dengan NISN <strong>{userProfile?.nisn}</strong>. Pastikan NISN pada profil Anda sudah benar dan data Anda sudah dimasukkan ke sistem oleh pihak sekolah.
            </AlertDescription>
          </Alert>
        );
      case 'already_linked':
        return (
           <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>NISN Sudah Ditautkan</AlertTitle>
            <AlertDescription>
              Data siswa dengan NISN <strong>{userProfile?.nisn}</strong> sudah ditautkan ke akun lain. Mohon hubungi administrator sekolah jika Anda merasa ini adalah sebuah kesalahan.
            </AlertDescription>
          </Alert>
        );
      case 'error':
         return (
           <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Terjadi Kesalahan</AlertTitle>
            <AlertDescription>
              {errorMessage || 'Terjadi kesalahan saat proses penautan akun.'}
            </AlertDescription>
          </Alert>
        );
      case 'loading':
      default:
        return <Loader2 className="h-8 w-8 animate-spin" />;
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Proses Penautan Akun Siswa</CardTitle>
          <CardDescription>
            Harap tunggu, kami sedang memproses penautan akun Anda secara otomatis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md h-48">
            {renderStatus()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
