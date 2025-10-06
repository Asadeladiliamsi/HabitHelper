'use client';

import { useAuth } from '@/firebase/provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import type { Student } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';

export default function LoadingPage() {
    const { user, userProfile, loading: authLoading } = useAuth();
    const router = useRouter();
    const [status, setStatus] = useState('Memverifikasi autentikasi...');

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!user) {
            router.replace('/login');
            return;
        }
        
        if (!userProfile) {
             console.error("User profile not found for logged in user:", user.uid);
             router.replace('/login');
             return;
        }

        setStatus('Mengarahkan ke dasbor...');
        
        const { role } = userProfile;
        
        if (role === 'admin') {
            router.replace('/admin/dashboard');
        } else if (role === 'siswa') {
            // Student flow is now handled by /pilih-kelas and /dashboard directly
            // This page just redirects to dashboard and lets it sort it out.
             router.replace('/dashboard');
        }
        else {
            router.replace('/dashboard');
        }

    }, [user, userProfile, authLoading, router]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center">
                <p className="font-semibold">Memuat Aplikasi</p>
                <p className="text-sm text-muted-foreground">{status}</p>
            </div>
        </div>
    );
}
