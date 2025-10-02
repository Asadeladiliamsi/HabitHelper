'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, getDocs, collection, query, where, addDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserProfile, UserRole, Habit, Student } from '@/lib/types';
import { HABIT_DEFINITIONS } from '@/lib/types';
import { useRouter } from 'next/navigation';


interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  studentData: Student | null; // For logged-in students
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signupAndCreateProfile: (data: { name: string; email: string; password: string, role: UserRole, nisn?: string, teacherCode?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // This effect runs once on mount to set up the auth state listener.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        // If user logs out, clear all data and finish loading.
        setUserProfile(null);
        setStudentData(null);
        setLoading(false);
      }
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // This effect reacts to changes in the authenticated user.
  useEffect(() => {
    if (user === null) {
      // User is logged out or auth state is initializing.
      setLoading(false);
      return;
    }

    setLoading(true);
    let studentUnsubscribe: (() => void) | null = null;
    
    // 1. Fetch UserProfile
    const userDocRef = doc(db, 'users', user.uid);
    const unsubProfile = onSnapshot(userDocRef, async (userDoc) => {
      if (userDoc.exists()) {
        const profile = userDoc.data() as UserProfile;
        setUserProfile(profile);

        // 2. If user is a student, fetch their corresponding Student data.
        if (profile.role === 'siswa') {
          const studentQuery = query(collection(db, 'students'), where('linkedUserUid', '==', user.uid));
          
          // Clean up previous student listener if it exists
          if (studentUnsubscribe) studentUnsubscribe();

          studentUnsubscribe = onSnapshot(studentQuery, async (studentSnapshot) => {
            if (!studentSnapshot.empty) {
              const studentDoc = studentSnapshot.docs[0];
              setStudentData({ id: studentDoc.id, ...studentDoc.data() } as Student);
              setLoading(false); // Finish loading once we have student data
            } else {
              // **Crucial:** Student document doesn't exist, so we create it.
              try {
                const newStudentRef = await addDoc(collection(db, 'students'), {
                  name: profile.name,
                  email: profile.email,
                  nisn: profile.nisn || '',
                  linkedUserUid: user.uid,
                  class: '', // Class is empty, forcing selection
                  createdAt: serverTimestamp(),
                  lockedDates: [],
                });
                // The onSnapshot will trigger again with the new data, so we just wait.
              } catch (error) {
                  console.error("Failed to auto-create student document:", error);
                  setStudentData(null);
                  setLoading(false);
              }
            }
          }, (error) => {
            console.error("Error fetching student data:", error);
            setStudentData(null);
            setLoading(false);
          });
        } else {
          // If user is not a student, clear student data and finish loading.
          setStudentData(null);
          setLoading(false);
        }
      } else {
        // UserProfile doesn't exist, this might happen during signup.
        setUserProfile(null);
        setStudentData(null);
        setLoading(false);
      }
    }, (error) => {
        console.error("Error fetching user profile:", error);
        setUserProfile(null);
        setStudentData(null);
        setLoading(false);
    });
    
    // Cleanup function
    return () => {
      unsubProfile();
      if (studentUnsubscribe) {
        studentUnsubscribe();
      }
    };
  }, [user]);
  
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

  const signupAndCreateProfile = async (data: { name: string; email: string; password: string, role: UserRole, nisn?: string, teacherCode?: string }) => {
      if (data.role === 'guru') {
      const settingsDocRef = doc(db, 'app_settings', 'registration');
      const docSnap = await getDoc(settingsDocRef);
      if (!docSnap.exists() || docSnap.data().teacherCode !== data.teacherCode) {
        throw new Error('Kode registrasi guru tidak valid.');
      }
    }
    
     const userCredential = await signup(data.email, data.password);
     const userDocRef = doc(db, 'users', userCredential.user.uid);
     
     const profileData: UserProfile = {
        uid: userCredential.user.uid,
        email: data.email,
        name: data.name,
        role: data.role,
        nisn: data.nisn || '',
      };

     await setDoc(userDocRef, {
        ...profileData,
        createdAt: serverTimestamp(),
      });
  };

  const logout = async () => {
    await signOut(auth);
    // State will be cleared by the onAuthStateChanged listener
    router.push('/login');
  };

  const value = { 
    user, 
    userProfile, 
    studentData,
    loading, 
    login, 
    signupAndCreateProfile, 
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
