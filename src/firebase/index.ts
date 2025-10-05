'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  where,
  query,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import React, { useState, useEffect, useContext, createContext } from 'react';
import type { UserProfile, Student, Habit } from '@/lib/types';
import { db, auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { HABIT_DEFINITIONS } from '@/lib/types';

const firebaseConfig = {
  "projectId": "habithelper-9o371",
  "appId": "1:140507692145:web:37f29c86ff391f3ec66fd0",
  "storageBucket": "habithelper-9o371.firebasestorage.app",
  "apiKey": "AIzaSyASvbApR6BP1T0g_ySTZWkxEdkVfsW_yiY",
  "authDomain": "habithelper-9o371.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "140507692145"
};

type FirebaseInstances = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
};

let firebaseInstances: FirebaseInstances | null = null;

export function initializeFirebase(): FirebaseInstances {
  if (typeof window !== 'undefined' && !firebaseInstances) {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const authInstance = getAuth(app);
    const dbInstance = getFirestore(app);
    firebaseInstances = { app, auth: authInstance, db: dbInstance };
  }
  // This is a fallback for server-side rendering
  if (!firebaseInstances) {
     const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const authInstance = getAuth(app);
    const dbInstance = getFirestore(app);
    firebaseInstances = { app, auth: authInstance, db: dbInstance };
  }
  return firebaseInstances;
}

// The one and only hook for authentication and user data.
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
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
            const studentQuery = query(collection(db, 'students'), where('linkedUserUid', '==', authUser.uid));
            const studentQuerySnapshot = await getDocs(studentQuery);

            if (!studentQuerySnapshot.empty) {
              const studentDoc = studentQuerySnapshot.docs[0];
              setStudentData({ id: studentDoc.id, ...studentDoc.data() } as Student);
            } else {
              setStudentData(null); // No student data linked yet
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

  return { user, userProfile, studentData, loading };
};
