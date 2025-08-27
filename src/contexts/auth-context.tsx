'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserProfile, UserRole } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  loginWithNisn: (nisn: string, pass: string) => Promise<any>;
  signup: (email: string, pass: string) => Promise<any>;
  validateAndCreateUserProfile: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to check if NISN is registered
const isNisnRegistered = async (nisn: string): Promise<boolean> => {
  const studentsRef = collection(db, 'students');
  const q = query(studentsRef, where('nisn', '==', nisn));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
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
  }, []);
  
  const login = async (email: string, pass: string) => {
    try {
        return await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
        if (error.code === 'auth/invalid-credential') {
            throw new Error('Email atau kata sandi salah. Silakan coba lagi.');
        }
        throw new Error('Terjadi kesalahan saat mencoba masuk.');
    }
  };

  const loginWithNisn = async (nisn: string, pass: string) => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('nisn', '==', nisn), where('role', '==', 'siswa'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        throw new Error(`NISN "${nisn}" tidak ditemukan atau bukan milik siswa.`);
    }

    const userData = querySnapshot.docs[0].data() as UserProfile;
    const email = userData.email;

    if (!email) {
        throw new Error(`Pengguna dengan NISN "${nisn}" tidak memiliki email terdaftar.`);
    }

    return login(email, pass);
  };

  const signup = async (email: string, pass: string) => {
    return createUserWithEmailAndPassword(auth, email, pass);
  };

  const validateAndCreateUserProfile = async (name: string, email: string, pass: string) => {
     // Create the user in Firebase Auth first
     const userCredential = await signup(email, pass);

     const userDocRef = doc(db, 'users', userCredential.user.uid);
     // All new signups are 'siswa' by default. Admin can change role later.
     const userProfileData: Omit<UserProfile, 'createdAt' | 'nisn'> = {
        uid: userCredential.user.uid,
        email: email,
        name: name,
        role: 'siswa',
      };
     await setDoc(userDocRef, {
        ...userProfileData,
        createdAt: serverTimestamp(),
      });
  }

  const logout = async () => {
    setUserProfile(null);
    await signOut(auth);
    router.push('/login');
  };

  const value = { user, userProfile, loading, login, loginWithNisn, signup, logout, validateAndCreateUserProfile };

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
