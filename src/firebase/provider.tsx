'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, onSnapshot } from 'firebase/firestore';
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
      if (!currentUser) {
        setUser(null);
        setUserProfile(null);
        setStudentData(null);
        setLoading(false);
        return;
      }

      setUser(currentUser);
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const profile = userDocSnap.data() as UserProfile;
        setUserProfile(profile);

        if (profile.role === 'siswa') {
          const studentDocRef = doc(db, 'students', currentUser.uid);
          const studentDocSnap = await getDoc(studentDocRef);
          if (studentDocSnap.exists()) {
            setStudentData({ id: studentDocSnap.id, ...studentDocSnap.data() } as Student);
          } else {
             const initialHabits: Habit[] = Object.entries(HABIT_DEFINITIONS).map(([name, subHabits]) => ({
                id: name.replace(/\s+/g, ''),
                name: name,
                subHabits: subHabits.map(subName => ({ id: subName.replace(/\s+/g, ''), name: subName, score: 0 }))
              }));

            const newStudentData: Omit<Student, 'id'> = {
              name: profile.name,
              email: profile.email || '',
              nisn: profile.nisn || '',
              avatarUrl: currentUser.photoURL || `https://placehold.co/100x100.png?text=${profile.name.charAt(0)}`,
              class: '', // IMPORTANT: Class is empty, forcing user to select it
              habits: initialHabits,
              linkedUserUid: profile.uid,
              createdAt: serverTimestamp(),
              lockedDates: [],
            };
            await setDoc(studentDocRef, newStudentData);
            const newDocSnap = await getDoc(studentDocRef);
            setStudentData({ id: newDocSnap.id, ...newDocSnap.data() } as Student);
          }
        } else {
          setStudentData(null);
        }
      } else {
        setUserProfile(null);
        setStudentData(null);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

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