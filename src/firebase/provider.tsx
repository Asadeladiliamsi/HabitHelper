'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserProfile, Student } from '@/lib/types';
import { HABIT_DEFINITIONS } from '@/lib/types';

interface FirebaseContextValue {
  user: User | null;
  userProfile: UserProfile | null;
  studentData: Student | null;
  loading: boolean;
}

const FirebaseContext = createContext<FirebaseContextValue | undefined>(undefined);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setUser(currentUser);
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        
        // Use onSnapshot to listen for real-time changes to the user profile
        const unsubProfile = onSnapshot(userDocRef, async (userDocSnap) => {
          if (userDocSnap.exists()) {
            setUserProfile(userDocSnap.data() as UserProfile);
          } else {
            // New user, create a user profile with 'siswa' as default role
            const newUserProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email,
              name: currentUser.displayName || 'Siswa Baru',
              role: 'siswa',
              nisn: '', // Initialize nisn
            };
            // Set the doc, but don't set loading to false yet.
            // The onSnapshot will trigger again with the new data, and the logic below will handle the rest.
            await setDoc(userDocRef, newUserProfile);
          }
        }, (error) => {
            console.error("Error listening to user profile:", error);
            setLoading(false);
        });
        
        return () => unsubProfile();

      } else {
        // User is logged out
        setUserProfile(null);
        setStudentData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userProfile || !user) {
        // If there's no user logged in at all, we are done loading.
        if (!user) setLoading(false);
        // If there is a user, but no profile yet, we are still loading, so don't set to false.
        return;
    };

    if (userProfile.role === 'siswa') {
        const studentDocRef = doc(db, 'students', userProfile.uid);
        const unsubscribeStudent = onSnapshot(studentDocRef, async (docSnap) => {
            if (docSnap.exists()) {
                setStudentData({ id: docSnap.id, ...docSnap.data() } as Student);
                setLoading(false);
            } else {
                // The student document doesn't exist, let's create it.
                // This will trigger the snapshot listener again.
                const initialHabits: Student['habits'] = Object.entries(HABIT_DEFINITIONS).map(([name, subHabits]) => ({
                    id: name.replace(/\s+/g, ''),
                    name: name,
                    subHabits: subHabits.map(subName => ({ id: subName.replace(/\s+/g, ''), name: subName, score: 0 }))
                }));

                const newStudentData: Omit<Student, 'id'> = {
                    name: userProfile.name,
                    email: userProfile.email || '',
                    nisn: userProfile.nisn || '',
                    avatarUrl: user?.photoURL || `https://placehold.co/100x100.png?text=${userProfile.name.charAt(0)}`,
                    class: '', // Class is empty, forcing user to select it
                    habits: initialHabits,
                    linkedUserUid: userProfile.uid,
                    createdAt: serverTimestamp(),
                    lockedDates: [],
                };
                // Don't set loading to false here. Wait for the snapshot to update.
                await setDoc(studentDocRef, newStudentData);
            }
        }, (error) => {
            console.error("Error listening to student data:", error);
            setLoading(false);
        });
        return () => unsubscribeStudent();

    } else {
        // Not a student, no need to fetch student data.
        setStudentData(null);
        setLoading(false);
    }
  }, [userProfile, user]);

  const value = { user, userProfile, studentData, loading };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return context;
};

export const useUser = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a FirebaseProvider');
  }
  return context.user;
};
