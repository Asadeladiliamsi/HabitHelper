'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation';
import { verifyNisn } from '@/app/actions';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (email: string, pass: string) => Promise<any>;
  validateAndCreateUserProfile: (name: string, email: string, pass: string) => Promise<void>;
  verifyAndLinkNisn: (nisn: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
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

          // Redirect student if NISN is not verified
          if (profile.role === 'siswa' && !profile.nisn && pathname !== '/verify-nisn') {
            router.replace('/verify-nisn');
          }
        } else {
          setUserProfile(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);
  
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
      };

     await setDoc(userDocRef, {
        ...profileData,
        createdAt: serverTimestamp(),
      });
  };

  const verifyAndLinkNisn = async (nisn: string): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: "Anda harus login terlebih dahulu." };
    }

    try {
      const result = await verifyNisn({ uid: user.uid, nisn });
      if (result.success) {
        // Manually update local user profile to reflect the change immediately
        setUserProfile(prevProfile => prevProfile ? { ...prevProfile, nisn } : null);
        router.push('/dashboard');
      }
      return result;
    } catch (error: any) {
      console.error("Error calling verifyNisn action:", error);
      return { success: false, message: error.message || "Terjadi kesalahan pada server." };
    }
  };


  const logout = async () => {
    setUserProfile(null);
    await signOut(auth);
    router.push('/login');
  };

  const value = { user, userProfile, loading, login, signup, validateAndCreateUserProfile, verifyAndLinkNisn, logout };

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
