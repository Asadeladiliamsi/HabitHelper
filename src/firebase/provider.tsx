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
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setLoading(true);
      setUser(currentUser);
      if (!currentUser) {
        setUserProfile(null);
        setStudentData(null);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribeProfile = onSnapshot(userDocRef, (userDocSnap) => {
      if (userDocSnap.exists()) {
        const profile = userDocSnap.data() as UserProfile;
        setUserProfile(profile);

        if (profile.role === 'siswa') {
          // Now handle student data part
          const studentDocRef = doc(db, 'students', user.uid);
          const unsubscribeStudent = onSnapshot(studentDocRef, async (studentDocSnap) => {
            if (studentDocSnap.exists()) {
              setStudentData({ id: studentDocSnap.id, ...studentDocSnap.data() } as Student);
              setLoading(false);
            } else {
              // Student role but no student data yet. This happens right after signup.
              // Let's create it.
              const initialHabits: Habit[] = Object.entries(HABIT_DEFINITIONS).map(([name, subHabits]) => ({
                id: name.replace(/\s+/g, ''),
                name: name,
                subHabits: subHabits.map(subName => ({ id: subName.replace(/\s+/g, ''), name: subName, score: 0 }))
              }));

              const newStudentData: Omit<Student, 'id'> = {
                name: profile.name,
                email: profile.email || '',
                nisn: profile.nisn || '',
                avatarUrl: user.photoURL || `https://placehold.co/100x100.png?text=${profile.name.charAt(0)}`,
                class: '', // IMPORTANT: Class is empty, forcing user to select it
                habits: initialHabits,
                linkedUserUid: profile.uid,
                createdAt: serverTimestamp(),
                lockedDates: [],
              };
              // Set the document. The snapshot listener above will pick it up and set the state.
              // We don't set loading to false here to wait for the listener to trigger.
              await setDoc(studentDocRef, newStudentData);
            }
          });
          return () => unsubscribeStudent();
        } else {
          // Not a student, no student data to fetch.
          setStudentData(null);
          setLoading(false);
        }
      } else {
        // User document doesn't exist yet, can happen right after signup.
        // The signup flow now creates this, so we just wait.
        // We don't set loading to false to avoid flicker.
      }
    });

    return () => unsubscribeProfile();
  }, [user]);

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
