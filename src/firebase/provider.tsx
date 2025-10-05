'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, query, collection, where } from 'firebase/firestore';
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
  studentData: Student | null;
  students: Student[];
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
    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      if (!authUser) {
        setUserProfile(null);
        setStudentData(null);
        setStudents([]);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const profile = docSnap.data() as UserProfile;
        setUserProfile(profile);
      } else {
        setUserProfile(null);
        setLoading(false); // No profile, stop loading
      }
    }, (error) => {
      console.error("Error fetching user profile:", error);
      setUserProfile(null);
      setLoading(false);
    });

    return () => unsubscribeProfile();
  }, [user]);

  useEffect(() => {
    if (!userProfile) {
        // If there's a user but no profile yet, we might still be loading or profile creation is pending.
        // But if we already know there's no user, we should not be loading.
        if (!user) setLoading(false);
        return;
    }

    let unsubscribeRelatedData: (() => void) | null = null;

    const role = userProfile.role;
    let q;

    if (role === 'siswa') {
      q = query(collection(db, 'students'), where('linkedUserUid', '==', userProfile.uid));
      unsubscribeRelatedData = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const studentDoc = snapshot.docs[0];
          setStudentData({ id: studentDoc.id, ...studentDoc.data() } as Student);
        } else {
          setStudentData(null);
        }
        setStudents([]); // Siswa role doesn't need the 'students' list
        setLoading(false);
      }, (error) => {
          console.error(`Error fetching data for role ${role}:`, error);
          setStudentData(null);
          setLoading(false);
      });
    } else if (role === 'orangtua') {
      q = query(collection(db, 'students'), where('parentId', '==', userProfile.uid));
      unsubscribeRelatedData = onSnapshot(q, (snapshot) => {
        setStudents(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Student)));
        setStudentData(null); // Orangtua role doesn't have a single 'studentData'
        setLoading(false);
      }, (error) => {
          console.error(`Error fetching data for role ${role}:`, error);
          setStudents([]);
          setLoading(false);
      });
    } else if (role === 'guru' || role === 'admin') {
      q = query(collection(db, 'students'));
      unsubscribeRelatedData = onSnapshot(q, (snapshot) => {
        setStudents(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Student)));
        setStudentData(null); // Guru/admin roles don't have a single 'studentData'
        setLoading(false);
      }, (error) => {
          console.error(`Error fetching data for role ${role}:`, error);
          setStudents([]);
          setLoading(false);
      });
    } else {
      // If role is unknown or not set, stop loading
      setLoading(false);
    }
    
    return () => {
      if (unsubscribeRelatedData) {
        unsubscribeRelatedData();
      }
    };
  }, [userProfile]); // This effect depends only on userProfile

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
