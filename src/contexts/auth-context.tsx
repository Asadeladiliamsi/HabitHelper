'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (email: string, pass: string) => Promise<any>;
  validateAndCreateUserProfile: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyAndLinkNisn: (uid: string, nisn: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
     
     const profileData: Omit<UserProfile, 'nisn'> = {
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

  const verifyAndLinkNisn = async (uid: string, nisn: string) => {
    // 1. Check if a student with this NISN exists in the 'students' collection
    const studentsQuery = query(collection(db, 'students'), where('nisn', '==', nisn));
    const studentSnapshot = await getDocs(studentsQuery);

    if (studentSnapshot.empty) {
      throw new Error('NISN tidak ditemukan. Pastikan NISN sudah benar dan terdaftar oleh guru Anda.');
    }

    // 2. Check if this NISN is already linked to another user account
    const usersQuery = query(collection(db, 'users'), where('nisn', '==', nisn));
    const userSnapshot = await getDocs(usersQuery);

    if (!userSnapshot.empty) {
      // Check if it's the same user trying to re-verify, which is okay.
      const isSameUser = userSnapshot.docs.some(doc => doc.id === uid);
      if (!isSameUser) {
        throw new Error('NISN ini sudah ditautkan ke akun lain.');
      }
    }
    
    // 3. Link the NISN to the user's profile
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, { nisn: nisn });
    
    // Update local userProfile state
    setUserProfile(prevProfile => prevProfile ? { ...prevProfile, nisn } : null);
  };


  const logout = async () => {
    setUserProfile(null);
    await signOut(auth);
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
