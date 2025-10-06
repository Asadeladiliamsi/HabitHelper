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
        // Wait for the authentication state and user profile to be loaded
        if (authLoading) {
            return;
        }

        // If no user is logged in, redirect to login
        if (!user) {
            router.replace('/login');
            return;
        }

        // If user is logged in, but profile isn't loaded yet, wait.
        // The provider is designed to load the profile, so if it's null after loading, it means no profile exists.
        if (!userProfile) {
            // This case might indicate an error (e.g., user doc not created),
            // but for routing, redirecting to login is a safe fallback.
            console.error("User profile not found for logged in user:", user.uid);
            router.replace('/login');
            return;
        }

        // --- At this point, we have a user and a userProfile ---
        setStatus('Profil ditemukan. Mengarahkan...');

        // Role-based routing logic
        const { role } = userProfile;

        if (role === 'admin') {
            router.replace('/admin/dashboard');
        } else if (role === 'siswa') {
            // For students, we need to check if they have selected a class
            setStatus('Memeriksa data siswa...');
            const studentDocRef = doc(db, 'students', user.uid);
            getDoc(studentDocRef).then(studentDoc => {
                if (studentDoc.exists()) {
                    const studentData = studentDoc.data() as Student;
                    if (studentData.class) {
                        router.replace('/dashboard');
                    } else {
                        router.replace('/pilih-kelas');
                    }
                } else {
                    // This is an inconsistent state, student user without a student document.
                    // Redirect to class selection as a fallback, it might handle the creation.
                    console.error("Student document not found for student user:", user.uid);
                    router.replace('/pilih-kelas');
                }
            }).catch(error => {
                console.error("Error fetching student document:", error);
                router.replace('/dashboard'); // Fallback to dashboard on error
            });
        } else {
            // For 'guru' and 'orangtua'
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
