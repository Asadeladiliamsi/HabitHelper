'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore, doc, getDoc, onSnapshot, query, collection, where, getDocs } from 'firebase/firestore';
import type { UserProfile, Student } from '@/lib/types';

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "habithelper-9o371",
  "appId": "1:140507692145:web:37f29c86ff391f3ec66fd0",
  "storageBucket": "habithelper-9o371.firebasestorage.app",
  "apiKey": "AIzaSyASvbApR6BP1T0g_ySTZWkxEdkVfsW_yiY",
  "authDomain": "habithelper-9o371.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "140507692145"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

interface FirebaseContextValue {
  user: User | null;
  userProfile: UserProfile | null;
  studentData: Student | null; // Data for the logged-in student
  students: Student[]; // Data for students linked to a parent/teacher/admin
  loading: boolean;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export const FirebaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      setLoading(true);
      if (authUser) {
        setUser(authUser);
        const userDocRef = doc(db, 'users', authUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const profile = userDocSnap.data() as UserProfile;
          setUserProfile(profile);

          // Stop any previous student listeners
          // This will be handled by role-specific listeners
        } else {
          setUserProfile(null);
          setLoading(false);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setStudentData(null);
        setStudents([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!userProfile) {
        setLoading(false);
        return;
    };

    let unsubscribeStudents: (() => void) | null = null;
    
    if (userProfile.role === 'siswa') {
        const q = query(collection(db, 'students'), where('linkedUserUid', '==', userProfile.uid));
        unsubscribeStudents = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const studentDoc = snapshot.docs[0];
                setStudentData({ id: studentDoc.id, ...studentDoc.data() } as Student);
            } else {
                setStudentData(null);
            }
            setLoading(false);
        });
    } else if (userProfile.role === 'orangtua') {
        const q = query(collection(db, 'students'), where('parentId', '==', userProfile.uid));
        unsubscribeStudents = onSnapshot(q, (snapshot) => {
            setStudents(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Student)));
            setLoading(false);
        });
    } else if (userProfile.role === 'guru' || userProfile.role === 'admin') {
        const q = query(collection(db, 'students'));
        unsubscribeStudents = onSnapshot(q, (snapshot) => {
            setStudents(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Student)));
            setLoading(false);
        });
    } else {
        setLoading(false);
    }
    
    return () => {
        if (unsubscribeStudents) {
            unsubscribeStudents();
        }
    }
  }, [userProfile]);


  const value = { user, userProfile, studentData, students, loading };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(FirebaseContext);
  if (context === null) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return context;
};
