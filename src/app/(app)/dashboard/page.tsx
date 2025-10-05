'use client';

import { Loader2 } from 'lucide-react';
import { DashboardClient } from '@/components/dashboard-client';
import { SiswaDashboardClient } from '@/components/siswa-dashboard-client';
import { OrangTuaDashboardClient } from '@/components/orang-tua-dashboard-client';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { UserProfile } from '@/lib/types';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }

    setProfileLoading(true);
    const unsub = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        setUserProfile(doc.data() as UserProfile);
      } else {
        setUserProfile(null);
      }
      setProfileLoading(false);
    }, () => {
      setUserProfile(null);
      setProfileLoading(false);
    });

    return () => unsub();
  }, [user, authLoading, router]);

  const loading = authLoading || profileLoading;

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!userProfile) {
    router.replace('/login');
    return (
        <div className="flex h-full w-full items-center justify-center">
             <Loader2 className="h-8 w-8 animate-spin" />
             <p className="ml-2">Profil tidak ditemukan. Mengalihkan ke halaman login...</p>
        </div>
    );
  }

  switch (userProfile.role) {
    case 'guru':
      return <DashboardClient />;
    case 'admin':
      router.replace('/admin/dashboard');
      return null;
    case 'orangtua':
      return <OrangTuaDashboardClient />;
    case 'siswa':
      return <SiswaDashboardClient />;
    default:
      router.replace('/login');
      return (
        <div className="flex h-full w-full items-center justify-center">
          <p>Peran pengguna tidak dikenali. Mengalihkan...</p>
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
  }
}
