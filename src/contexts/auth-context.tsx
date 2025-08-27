'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserProfile, UserRole } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (email: string, pass: string) => Promise<any>;
  validateAndCreateUserProfile: (name: string, email: string, pass: string, role: UserRole) => Promise<void>;
  verifyAndLinkNisn: (nisn: string) => Promise<void>;
  logout: () => Promise<void>;
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
          // This case might occur if the user exists in Auth but not in Firestore.
          // We can decide to create a profile here or log them out.
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

  const validateAndCreateUserProfile = async (name: string, email: string, pass: string, role: UserRole) => {
     const userCredential = await signup(email, pass);
     const userDocRef = doc(db, 'users', userCredential.user.uid);
     const profileData: Omit<UserProfile, 'createdAt' | 'nisn'> = {
        uid: userCredential.user.uid,
        email: email,
        name: name,
        role: role,
      };

     await setDoc(userDocRef, {
        ...profileData,
        createdAt: serverTimestamp(),
      });
  };

  const verifyAndLinkNisn = async (nisn: string) => {
    if (!user) {
      throw new Error("Anda harus login terlebih dahulu.");
    }
    
    // 1. Check if the NISN exists in the 'students' collection
    const studentsRef = collection(db, 'students');
    const studentQuery = query(studentsRef, where('nisn', '==', nisn));
    const studentSnapshot = await getDocs(studentQuery);
    
    if (studentSnapshot.empty) {
      throw new Error(`NISN "${nisn}" tidak ditemukan dalam data siswa. Mohon hubungi guru Anda.`);
    }

    // 2. Check if this NISN is already linked to another user
    const usersRef = collection(db, 'users');
    const userNisnQuery = query(usersRef, where('nisn', '==', nisn));
    const userNisnSnapshot = await getDocs(userNisnQuery);

    if (!userNisnSnapshot.empty) {
        // Check if it's the current user who is already linked
        const isLinkedToCurrentUser = userNisnSnapshot.docs.some(doc => doc.id === user.uid);
        if (!isLinkedToCurrentUser) {
            throw new Error(`NISN "${nisn}" ini sudah terhubung dengan akun lain.`);
        }
    }
    
    // 3. If valid and available, link it to the current user
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, { nisn: nisn });

    // 4. Update local user profile state
    setUserProfile(prevProfile => prevProfile ? { ...prevProfile, nisn: nisn } : null);
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
