'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserProfile, Student, Habit } from '@/lib/types';
import { HABIT_DEFINITIONS } from '@/lib/types';

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
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        // User is logged in, listen to their profile
        const userDocRef = doc(db, 'users', currentUser.uid);
        const unsubscribeProfile = onSnapshot(userDocRef, async (userDocSnap) => {
          if (userDocSnap.exists()) {
            setUserProfile(userDocSnap.data() as UserProfile);
          } else {
            // New user, create a user profile with 'siswa' as default role
            const newUserProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email,
              name: currentUser.displayName || 'Siswa Baru',
              role: 'siswa',
              nisn: '',
            };
            // This will trigger the snapshot listener again
            await setDoc(userDocRef, newUserProfile);
          }
        }, (error) => {
          console.error("Error listening to user profile:", error);
          setUserProfile(null);
          setLoading(false);
        });
        return () => unsubscribeProfile();
      } else {
        // User is logged out
        setUser(null);
        setUserProfile(null);
        setStudentData(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user || !userProfile) {
      if (!user) setLoading(false);
      return;
    }

    if (userProfile.role === 'siswa') {
      const studentDocRef = doc(db, 'students', user.uid);
      const unsubscribeStudent = onSnapshot(studentDocRef, async (docSnap) => {
        if (docSnap.exists()) {
          setStudentData({ id: docSnap.id, ...docSnap.data() } as Student);
          setLoading(false);
        } else {
            // Student data not linked by admin/teacher yet, OR it's a brand new 'siswa' user
            // Let's create it automatically.
            const initialHabits: Habit[] = Object.entries(HABIT_DEFINITIONS).map(([name, subHabits]) => ({
                id: name.replace(/\s+/g, ''),
                name: name,
                subHabits: subHabits.map(subName => ({ id: subName.replace(/\s+/g, ''), name: subName, score: 0 }))
            }));

            const newStudentData: Omit<Student, 'id'> = {
                name: userProfile.name,
                email: userProfile.email || '',
                nisn: userProfile.nisn || '',
                avatarUrl: user?.photoURL || `https://placehold.co/100x100.png?text=${userProfile.name.charAt(0)}`,
                class: '', // IMPORTANT: Class is empty, forcing user to select it
                habits: initialHabits,
                linkedUserUid: userProfile.uid,
                createdAt: serverTimestamp(),
                lockedDates: [],
            };
            // Set the document, the snapshot listener will pick it up and set loading to false.
            await setDoc(studentDocRef, newStudentData);
        }
      }, (error) => {
        console.error("Error listening to student data:", error);
        setStudentData(null);
        setLoading(false);
      });

      return () => unsubscribeStudent();
    } else {
      // Not a student, no need to fetch student data for them.
      setStudentData(null);
      setLoading(false);
    }
  }, [user, userProfile]);

  const value = { user, userProfile, studentData, loading };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useAuth = () => {
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
  return context.user;
};
