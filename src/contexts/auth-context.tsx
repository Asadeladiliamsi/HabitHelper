'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserProfile, UserRole } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        } else {
          // This case might happen if the user exists in Auth but not in Firestore.
          // For example, if Firestore document creation failed during signup.
          // You might want to handle this case, e.g., by creating the document here or logging the user out.
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
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // No need to push, onAuthStateChanged will handle the state update
      // and the AppLayout will handle the redirect.
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Login Gagal',
        description: error.message,
        variant: 'destructive',
      });
      console.error("Error logging in:", error);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, pass: string, role: UserRole) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const newUser = userCredential.user;
      
      const userProfileData: UserProfile = {
        uid: newUser.uid,
        email: newUser.email,
        role: role,
      };

      await setDoc(doc(db, 'users', newUser.uid), userProfileData);
      
      // The onAuthStateChanged listener will automatically update user and userProfile state.
      // So, no need to call setUser and setUserProfile here.
      
      router.push('/dashboard');

    } catch (error: any) {
      toast({
        title: 'Pendaftaran Gagal',
        description: error.message,
        variant: 'destructive',
      });
      console.error("Error signing up:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // After signOut, onAuthStateChanged will trigger, setting user to null.
      // The AppLayout will then redirect to /login.
      router.push('/');
    } catch (error: any) {
       toast({
        title: 'Logout Gagal',
        description: error.message,
        variant: 'destructive',
      });
      console.error("Error signing out:", error);
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    login,
    signup,
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
