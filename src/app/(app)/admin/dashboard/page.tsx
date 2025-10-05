'use client';

import { AdminDashboardClient } from '@/components/admin-dashboard-client';
import { useAuth } from '@/firebase/provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';
import { doc, onSnapshot } from 'firebase/firestore';


export default function AdminDashboardPage() {
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

        const unsub = onSnapshot(doc(db, 'users', user.uid), (doc) => {
            if (doc.exists()) {
                const profile = doc.data() as UserProfile;
                setUserProfile(profile);
                if (profile.role !== 'admin') {
                    router.replace('/dashboard');
                }
            } else {
                setUserProfile(null);
                router.replace('/login');
            }
            setProfileLoading(false);
        });

        return () => unsub();
    }, [authLoading, user, router]);

    const loading = authLoading || profileLoading;

    if (loading || !userProfile || userProfile.role !== 'admin') {
        return (
          <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        );
    }
    
  return (
    <AdminDashboardClient />
  );
}
