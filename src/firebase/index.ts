import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  where,
  query,
  getDocs,
} from 'firebase/firestore';
import { onAuthStateChanged, type User } from 'firebase/auth';
import React, { useState, useEffect } from 'react';
import type { UserProfile, Student } from '@/lib/types';
import { db, auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

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
    const auth = getAuth(app);
    const db = getFirestore(app);
    firebaseInstances = { app, auth, db };
  }
  if (!firebaseInstances) {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    const db = getFirestore(app);
    firebaseInstances = { app, auth, db };
  }
  return firebaseInstances;
}

export { useUser } from './auth/use-user';
export { useAuth } from './provider';

// This is the new centralized hook for authentication and user data.
export const useAuthOld = () => {
  const { user, loading: authLoading } = useUser();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) {
      setProfileLoading(true);
      return;
    }
    if (!user) {
      setUserProfile(null);
      setStudentData(null);
      setProfileLoading(false);
      return;
    }

    const fetchUserData = async () => {
      setProfileLoading(true);
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const profile = userDocSnap.data() as UserProfile;
        setUserProfile(profile);

        if (profile.role === 'siswa') {
          const studentDocRef = doc(db, 'students', user.uid);
          const studentDocSnap = await getDoc(studentDocRef);
          if (studentDocSnap.exists()) {
            setStudentData({ id: studentDocSnap.id, ...studentDocSnap.data() } as Student);
          } else {
             // Student just signed up, their student record might not exist yet.
             // We'll create it. This is a critical recovery step.
            console.log(`Student record for ${user.uid} not found. Creating it.`);
            const newStudentData: Omit<Student, 'id' | 'habits' | 'avatarUrl' | 'class'> = {
              name: profile.name,
              email: profile.email || '',
              nisn: profile.nisn || '',
              linkedUserUid: user.uid,
            };
            try {
              await setDoc(studentDocRef, newStudentData);
              const newStudentSnap = await getDoc(studentDocRef);
              if (newStudentSnap.exists()) {
                setStudentData({ id: newStudentSnap.id, ...newStudentSnap.data() } as Student);
              }
            } catch (e) {
               console.error("Failed to create student record automatically:", e);
            }
          }
        } else {
          setStudentData(null);
        }
      } else {
        // This can happen briefly after signup, before the profile is created.
        setUserProfile(null);
        setStudentData(null);
      }
      setProfileLoading(false);
    };

    fetchUserData();
  }, [user, authLoading, router]);

  const loading = authLoading || profileLoading;

  return { user, userProfile, studentData, loading };
};
