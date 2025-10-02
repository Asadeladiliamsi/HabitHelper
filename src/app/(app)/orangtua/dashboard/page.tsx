'use client';

import { OrangTuaDashboardClient } from '@/components/orang-tua-dashboard-client';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OrangTuaDashboardPage() {
    const { userProfile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!userProfile || userProfile.role !== 'orangtua')) {
             router.replace('/dashboard');
        }
    }, [userProfile, loading, router]);


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
