'use client';

import { OrangTuaDashboardClient } from '@/components/orang-tua-dashboard-client';
import { useAuth } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';


export default function OrangTuaDashboardPage() {
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
                const profile = doc.data() as UserProfile;
                setUserProfile(profile);
                if (profile.role !== 'orangtua') {
                    router.replace('/dashboard');
                }
            } else {
                 setUserProfile(null);
                 router.replace('/login');
            }
            setProfileLoading(false);
        });

        return () => unsub();
    }, [user, authLoading, router]);

    const loading = authLoading || profileLoading;

    if (loading || !userProfile || userProfile.role !== 'orangtua') {
        return (
          <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        );
    }

  return (
    <OrangTuaDashboardClient />
  );
}
