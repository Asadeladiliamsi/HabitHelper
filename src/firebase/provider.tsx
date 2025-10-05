'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore, doc, getDoc, onSnapshot, query, collection, where, Timestamp } from 'firebase/firestore';
import type { UserProfile, Student, HabitEntry } from '@/lib/types';
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

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

interface FirebaseContextValue {
  user: User | null;
  userProfile: UserProfile | null;
  studentData: Student | null;
  students: Student[]; // For parent/teacher roles
  habitEntries: HabitEntry[];
  loading: boolean;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export const FirebaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [studentData, setStudentData] = useState<Student | null>(null); // For siswa role
  const [students, setStudents] = useState<Student[]>([]); // For parent/teacher roles
  const [habitEntries, setHabitEntries] = useState<HabitEntry[]>([]);
  const [loading, setLoading] = useState(true);

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

          let studentIds: string[] = [];

          if (profile.role === 'siswa') {
            const studentQuery = query(collection(db, 'students'), where('linkedUserUid', '==', authUser.uid));
            const studentSnap = await getDoc(studentQuery.docs[0]?.ref);
            if (studentSnap?.exists()) {
                const student = { id: studentSnap.id, ...studentSnap.data() } as Student;
                setStudentData(student);
                studentIds = [student.id];
            }
          } else if (profile.role === 'orangtua') {
            const studentsQuery = query(collection(db, 'students'), where('parentId', '==', authUser.uid));
            const studentsSnap = await getDocs(studentsQuery);
            const parentStudents = studentsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Student));
            setStudents(parentStudents);
            studentIds = parentStudents.map(s => s.id);
          } else if (profile.role === 'guru' || profile.role === 'admin') {
            const studentsQuery = query(collection(db, 'students'));
            const studentsSnap = await getDocs(studentsQuery);
            const allStudents = studentsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Student));
            setStudents(allStudents);
            studentIds = allStudents.map(s => s.id);
          }

          if (studentIds.length > 0) {
            // Firestore 'in' queries are limited to 30 elements. Chunk if necessary.
            const habitEntriesQuery = query(collection(db, 'habit_entries'), where('studentId', 'in', studentIds));
            onSnapshot(habitEntriesQuery, (snapshot) => {
              const entries = snapshot.docs.map(d => ({
                ...d.data(),
                id: d.id,
                date: (d.data().date as Timestamp).toDate()
              } as HabitEntry));
              setHabitEntries(entries);
              setLoading(false);
            });
          } else {
            setHabitEntries([]);
            setLoading(false);
          }

        } else {
           // User exists in auth but not in firestore, probably mid-signup
           setUserProfile(null);
           setLoading(false);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setStudentData(null);
        setStudents([]);
        setHabitEntries([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = { user, userProfile, studentData, students, habitEntries, loading };

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
