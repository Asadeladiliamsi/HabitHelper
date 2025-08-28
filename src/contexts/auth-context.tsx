'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation';
import { verifyNisnFlow } from '@/ai/flows/verify-nisn-flow';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (email: string, pass: string) => Promise<any>;
  validateAndCreateUserProfile: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyAndLinkNisn: (nisn: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const profile = userDoc.data() as UserProfile;
          setUserProfile(profile);
          // Core redirection logic
          if (pathname !== '/verify-nisn' && profile.role === 'siswa' && !profile.nisn) {
            router.replace('/verify-nisn');
          } else if (pathname === '/verify-nisn' && profile.nisn) {
            router.replace('/dashboard');
          }

        } else {
          // This case is for new signups before a profile is created.
          // Let them proceed to login/signup.
          setUserProfile(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        const isAppPage = !['/login', '/signup', '/', '/verify-nisn'].includes(pathname);
         if (isAppPage) {
            router.replace('/login');
         }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router]);
  
  const login = async (email: string, pass: string) => {
    try {
        return await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            throw new Error('Email atau kata sandi salah. Silakan coba lagi.');
        }
        console.error("Login error:", error);
        throw new Error('Terjadi kesalahan saat mencoba masuk.');
    }
  };

  const signup = async (email: string, pass: string) => {
    return createUserWithEmailAndPassword(auth, email, pass);
  };

  const validateAndCreateUserProfile = async (name: string, email: string, pass: string) => {
     const userCredential = await signup(email, pass);
     const userDocRef = doc(db, 'users', userCredential.user.uid);
     
     const profileData: UserProfile = {
        uid: userCredential.user.uid,
        email: email,
        name: name,
        role: 'siswa',
        // NISN is not present on creation
      };

     await setDoc(userDocRef, {
        ...profileData,
        createdAt: serverTimestamp(),
      });
  };

  const verifyAndLinkNisn = async (nisn: string): Promise<{ success: boolean; message: string }> => {
    if (!user) {
        throw new Error("Pengguna tidak terautentikasi.");
    }

    try {
        const result = await verifyNisnFlow({ uid: user.uid, nisn });

        if (result.success) {
            // Manually update the userProfile in the context for immediate UI feedback
            setUserProfile(prev => prev ? { ...prev, nisn } : null);
        }

        return result;

    } catch (error: any) {
        console.error('Error calling verifyNisnFlow:', error);
        return { success: false, message: error.message || 'Terjadi kesalahan tidak terduga.' };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
    router.push('/login');
  };

  const value = { user, userProfile, loading, login, signup, validateAndCreateUserProfile, logout, verifyAndLinkNisn };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
