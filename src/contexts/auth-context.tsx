'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, getDocs, collection, query, where } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';
import { useRouter } from 'next/navigation';


interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, nisn: string) => Promise<any>;
  signup: (email: string, pass: string) => Promise<any>;
  validateAndCreateUserProfile: (name: string, email: string, nisn: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUserProfile = useCallback(async (user: User | null) => {
    if (!user) {
      setUser(null);
      setUserProfile(null);
      setLoading(false);
      return;
    }

    setUser(user);
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      setUserProfile(userDoc.data() as UserProfile);
    } else {
      setUserProfile(null);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      await fetchUserProfile(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserProfile]);
  
  const login = async (email: string, nisn: string) => {
     try {
        // 1. Find user profile by email
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error('Email tidak terdaftar.');
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data() as UserProfile;

        // 2. Verify NISN
        if (userData.nisn !== nisn) {
            throw new Error('NISN yang Anda masukkan salah.');
        }
        
        // 3. If NISN is correct, sign in with Firebase Auth
        // Here, we use NISN as the password for authentication
        return await signInWithEmailAndPassword(auth, email, nisn);

    } catch (error: any) {
         if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            // This can happen if password (NISN) in Auth doesn't match, or email not in Auth
            throw new Error('Email atau NISN salah. Silakan coba lagi.');
        }
        // Re-throw custom messages
        if (error.message === 'Email tidak terdaftar.' || error.message === 'NISN yang Anda masukkan salah.') {
            throw error;
        }
        console.error("Login error:", error);
        throw new Error('Terjadi kesalahan saat mencoba masuk.');
    }
  };

  const signup = async (email: string, pass: string) => {
    return createUserWithEmailAndPassword(auth, email, pass);
  };

  const validateAndCreateUserProfile = async (name: string, email: string, nisn: string) => {
     // For signup, the password is the NISN
     const userCredential = await signup(email, nisn);
     const userDocRef = doc(db, 'users', userCredential.user.uid);
     
     const profileData: UserProfile = {
        uid: userCredential.user.uid,
        email: email,
        name: name,
        role: 'siswa',
        nisn: nisn,
      };

     await setDoc(userDocRef, {
        ...profileData,
        createdAt: serverTimestamp(),
      });
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
    router.push('/login');
  };

  const value = { 
    user, 
    userProfile, 
    loading, 
    login, 
    signup, 
    validateAndCreateUserProfile, 
    logout,
  };

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
