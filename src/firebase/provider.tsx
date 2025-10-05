'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserProfile, Student } from '@/lib/types';

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
        // User is logged in, fetch/create profile
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setUserProfile(userDocSnap.data() as UserProfile);
        } else {
          // New user, create a user profile with 'siswa' as default role
          const newUserProfile: UserProfile = {
            uid: currentUser.uid,
            email: currentUser.email,
            name: currentUser.displayName || 'Siswa Baru',
            role: 'siswa',
          };
          await setDoc(userDocRef, newUserProfile);
          setUserProfile(newUserProfile);
        }
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
    if (!userProfile) {
        if (!user) { // Only set loading to false if there is no user, otherwise we are waiting for profile
             setLoading(false);
        }
        return;
    };

    const isSiswa = userProfile.role === 'siswa';

    if (isSiswa) {
        const studentDocRef = doc(db, 'students', userProfile.uid);
        const unsubscribeStudent = onSnapshot(studentDocRef, async (docSnap) => {
            if (docSnap.exists()) {
                setStudentData({ id: docSnap.id, ...docSnap.data() } as Student);
            } else {
                // The student document doesn't exist, let's create it.
                const newStudentData: Omit<Student, 'id'> = {
                    name: userProfile.name,
                    email: userProfile.email || '',
                    nisn: userProfile.nisn || '',
                    avatarUrl: user?.photoURL || `https://placehold.co/100x100.png?text=${userProfile.name.charAt(0)}`,
                    class: '', // Class is empty, forcing user to select it
                    habits: [],
                    linkedUserUid: userProfile.uid,
                    createdAt: serverTimestamp(),
                    lockedDates: [],
                };
                await setDoc(studentDocRef, newStudentData);
                // The snapshot listener will pick up the new data and setStudentData
            }
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
