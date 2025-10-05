'use client';

import { AdminDashboardClient } from '@/components/admin-dashboard-client';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminDashboardPage() {
    const { userProfile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && userProfile?.role !== 'admin') {
            router.replace('/dashboard');
        }
    }, [loading, userProfile, router]);

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
