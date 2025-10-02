

'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, serverTimestamp, getDocs, where, setDoc, writeBatch, Timestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Student, Habit, SubHabit, HabitEntry } from '@/lib/types';
import { useAuth } from './auth-context';
import { HABIT_DEFINITIONS } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { startOfDay, endOfDay, isSameDay, format as formatDate } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface StudentContextType {
  students: Student[];
  loading: boolean;
  dateLoading: boolean;
  addStudent: (newStudent: Omit<Student, 'id' | 'habits' | 'avatarUrl'>) => Promise<void>;
  updateStudent: (studentId: string, updatedData: Partial<Omit<Student, 'id' | 'habits' | 'avatarUrl'>>) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  addHabitEntry: (data: Omit<HabitEntry, 'id' | 'timestamp' | 'recordedBy'>) => Promise<void>;
  linkParentToStudent: (studentId: string, parentId: string, parentName: string) => Promise<void>;
  getHabitsForDate: (studentId: string, date: Date) => Habit[];
  fetchHabitEntriesForRange: (dateRange: DateRange | undefined) => () => void;
  habitEntries: HabitEntry[];
  toggleDateLock: (studentId: string, date: Date, lock: boolean) => Promise<void>;
  updateStudentClass: (studentId: string, className: string) => Promise<void>;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider = ({ children }: { children: React.React.Node }) => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [habitEntries, setHabitEntries] = useState<HabitEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateLoading, setDateLoading] = useState(false);
  
  useEffect(() => {
    if (authLoading || !user) {
      setLoading(false); 
      setStudents([]);
      return;
    }

    setLoading(true);

    let q;
    if (userProfile?.role === 'guru' || userProfile?.role === 'admin') {
      q = query(collection(db, 'students'));
    } else if (userProfile?.role === 'orangtua') {
      q = query(collection(db, 'students'), where('parentId', '==', user.uid));
    } else if (userProfile?.role === 'siswa' && user.email) {
      // Siswa bisa melihat datanya sendiri, bahkan jika belum ada kelas, untuk proses pemilihan kelas.
      q = query(collection(db, 'students'), where('linkedUserUid', '==', user.uid));
    } else {
       setLoading(false);
       setStudents([]);
       return;
    }


    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const studentsData: Student[] = [];
      querySnapshot.forEach((doc) => {
        studentsData.push({ id: doc.id, ...doc.data() } as Student);
      });
      
      const studentsWithAvatars = studentsData.map(student => ({
        ...student,
        avatarUrl: student.avatarUrl || `https://placehold.co/100x100.png?text=${student.name.charAt(0)}`
      }));

      setStudents(studentsWithAvatars);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching students:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, userProfile, authLoading]);

 const addStudent = async (newStudentData: Omit<Student, 'id' | 'habits' | 'avatarUrl'>) => {
    if (!user) throw new Error("Authentication required");

    // Check for NISN uniqueness
    const nisnQuery = query(collection(db, 'students'), where('nisn', '==', newStudentData.nisn));
    const nisnSnapshot = await getDocs(nisnQuery);
    if (!nisnSnapshot.empty) {
      throw new Error(`NISN ${newStudentData.nisn} sudah digunakan oleh siswa lain.`);
    }

    // Check if the user account is already linked to another student
    const userLinkQuery = query(collection(db, 'students'), where('linkedUserUid', '==', newStudentData.linkedUserUid));
    const userLinkSnapshot = await getDocs(userLinkQuery);
    if (!userLinkSnapshot.empty) {
        throw new Error(`Akun pengguna ini sudah ditautkan ke siswa lain.`);
    }

    // Initialize habits and sub-habits with default score
    const initialHabits: Habit[] = Object.entries(HABIT_DEFINITIONS).map(([habitName, subHabitNames], habitIndex) => ({
      id: `${habitIndex + 1}`,
      name: habitName,
      subHabits: subHabitNames.map((subHabitName, subHabitIndex) => ({
        id: `${habitIndex + 1}-${subHabitIndex + 1}`,
        name: subHabitName,
        score: 0, 
      })),
    }));

    await addDoc(collection(db, 'students'), {
      ...newStudentData,
      habits: initialHabits,
      createdAt: serverTimestamp(),
      lockedDates: [],
    });
  };
  
   const updateStudent = async (studentId: string, updatedData: Partial<Omit<Student, 'id' | 'habits' | 'avatarUrl'>>) => {
    if (!user || !['admin', 'guru'].includes(userProfile?.role || '')) throw new Error("Authentication required or insufficient permissions");
    
    // If NISN is being updated, check for uniqueness first
    if (updatedData.nisn) {
      const q = query(collection(db, 'students'), where('nisn', '==', updatedData.nisn));
      const querySnapshot = await getDocs(q);
      const isDuplicate = !querySnapshot.empty && querySnapshot.docs.some(doc => doc.id !== studentId);
      if (isDuplicate) {
        throw new Error(`NISN ${updatedData.nisn} sudah digunakan.`);
      }
    }
    
    const studentDocRef = doc(db, 'students', studentId);
    await updateDoc(studentDocRef, {
        ...updatedData,
        updatedAt: serverTimestamp(),
    });
  };

  const updateStudentClass = async (studentId: string, className: string) => {
    if (!user) throw new Error("Authentication required");
    const studentDocRef = doc(db, 'students', studentId);
    await updateDoc(studentDocRef, { class: className });
  };

  const deleteStudent = async (studentId: string) => {
    if (!user || userProfile?.role !== 'admin') throw new Error("Authentication required or insufficient permissions");
    const studentDocRef = doc(db, 'students', studentId);
    await deleteDoc(studentDocRef);
  };
  
  const fetchHabitEntriesForRange = useCallback((dateRange: DateRange | undefined): (() => void) => {
    if (!user || !dateRange?.from) {
      setHabitEntries([]);
      return () => {};
    }
    
    setDateLoading(true);
    
    const from = startOfDay(dateRange.from);
    const to = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);

    const q = query(
      collection(db, 'habit_entries'), 
      where('date', '>=', from),
      where('date', '<=', to)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const entries: HabitEntry[] = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.date && data.timestamp) {
            entries.push({
            id: doc.id,
            ...data,
            date: (data.date as Timestamp).toDate(),
            timestamp: data.timestamp,
            } as HabitEntry);
        }
      });
      
      const studentIds = new Set(students.map(s => s.id));
      const filteredEntries = entries.filter(entry => studentIds.has(entry.studentId));

      setHabitEntries(filteredEntries);
      setDateLoading(false);
    }, (error) => {
      console.error("Error fetching real-time habit entries:", error);
      setHabitEntries([]);
      setDateLoading(false);
    });

    return unsubscribe;
  }, [user, students]);


  const addHabitEntry = async (data: Omit<HabitEntry, 'id' | 'timestamp' | 'recordedBy'>) => {
    if (!user) throw new Error("Authentication required.");
    
    await addDoc(collection(db, 'habit_entries'), {
      ...data,
      recordedBy: user.uid,
      timestamp: serverTimestamp()
    });
  };
  
  const linkParentToStudent = async (studentId: string, parentId: string, parentName: string) => {
    if (!user || !['admin', 'guru'].includes(userProfile?.role || '')) throw new Error("Authentication required or insufficient permissions");
    const studentDocRef = doc(db, 'students', studentId);
    await updateDoc(studentDocRef, { parentId, parentName });
  }

  const toggleDateLock = async (studentId: string, date: Date, lock: boolean) => {
    if (!user || !['admin', 'guru'].includes(userProfile?.role || '')) throw new Error("Authentication required or insufficient permissions");
    const studentDocRef = doc(db, 'students', studentId);
    const formattedDate = formatDate(date, 'yyyy-MM-dd');

    await updateDoc(studentDocRef, {
      lockedDates: lock ? arrayUnion(formattedDate) : arrayRemove(formattedDate),
    });
  };
  
  const getHabitsForDate = useCallback((studentId: string, date: Date): Habit[] => {
      const student = students.find(s => s.id === studentId);
      if (!student) return [];
      
      const relevantEntries = habitEntries.filter(entry => 
        entry.studentId === studentId && isSameDay(entry.date, date)
      );
      
      const habitsFromDefs: Habit[] = Object.entries(HABIT_DEFINITIONS).map(([habitName, subHabitNames], habitIndex) => ({
        id: `${habitIndex + 1}`,
        name: habitName,
        subHabits: subHabitNames.map((subHabitName, subHabitIndex) => {
          const entry = relevantEntries
              .filter(e => e.habitName === habitName && e.subHabitName === subHabitName)
              .sort((a, b) => (b.timestamp as Timestamp).toMillis() - (a.timestamp as Timestamp).toMillis())[0];

          return {
            id: `${habitIndex + 1}-${subHabitIndex + 1}`,
            name: subHabitName,
            score: entry ? entry.score : 0,
          };
        }),
      }));
      return habitsFromDefs;

  }, [students, habitEntries]);


  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const contextValue = {
    students,
    loading,
    dateLoading,
    addStudent,
    updateStudent,
    deleteStudent,
    addHabitEntry,
    linkParentToStudent,
    getHabitsForDate,
    fetchHabitEntriesForRange,
    habitEntries,
    toggleDateLock,
    updateStudentClass,
  };

  return (
    <StudentContext.Provider value={contextValue}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};
