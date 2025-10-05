'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeFirebase, db } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import type { UserProfile, Student } from '@/lib/types';
import { auth } from '@/lib/firebase';
import { ThemeProvider } from 'next-themes';

interface FirebaseContextValue {
  user: User | null;
  userProfile: UserProfile | null;
  studentData: Student | null;
  loading: boolean;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeFirebase();
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setLoading(true);
      if (authUser) {
        setUser(authUser);
        const userDocRef = doc(db, 'users', authUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const profile = userDocSnap.data() as UserProfile;
          setUserProfile(profile);

          if (profile.role === 'siswa') {
            const studentDocRef = doc(db, 'students', authUser.uid);
            const studentDocSnap = await getDoc(studentDocRef);
            if (studentDocSnap.exists()) {
              setStudentData({ id: studentDocSnap.id, ...studentDocSnap.data() } as Student);
            } else {
              // This case should be handled by the logic in useAuth now
               setStudentData(null);
            }
          } else {
            setStudentData(null);
          }
        } else {
          // Profile doesn't exist, this might be right after signup
          setUserProfile(null);
          setStudentData(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setStudentData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time listeners for student and user profile
  useEffect(() => {
    let unsubProfile: (() => void) | undefined;
    let unsubStudent: (() => void) | undefined;

    if (user?.uid) {
      const userDocRef = doc(db, 'users', user.uid);
      unsubProfile = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          const newProfile = doc.data() as UserProfile;
          setUserProfile(newProfile);
          if (newProfile.role !== 'siswa') {
             setStudentData(null); // Clear student data if role changes
          }
        } else {
          setUserProfile(null);
        }
      });

      const studentDocRef = doc(db, 'students', user.uid);
      unsubStudent = onSnapshot(studentDocRef, (doc) => {
         if (doc.exists()) {
            setStudentData({ id: doc.id, ...doc.data() } as Student);
         } else {
            setStudentData(null);
         }
      });

    }

    return () => {
      unsubProfile?.();
      unsubStudent?.();
    };
  }, [user?.uid]);
  
  const value = { user, userProfile, studentData, loading };

  return (
    <FirebaseContext.Provider value={value}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
        </ThemeProvider>
    </FirebaseContext.Provider>
  );
}

export const useAuth = (): FirebaseContextValue => {
  const context = useContext(FirebaseContext);
  if (context === null) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return context;
};

export const useUser = () => {
  const context = useContext(FirebaseContext);
  if (context === null) {
    throw new Error('useUser must be used within a FirebaseProvider');
  }
  return { user: context.user, loading: context.loading };
};
