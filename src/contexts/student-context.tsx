
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, serverTimestamp, getDocs, where, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Student, Habit, SubHabit, HabitEntry } from '@/lib/types';
import { useAuth } from './auth-context';
import { HABIT_DEFINITIONS } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface StudentContextType {
  students: Student[];
  loading: boolean;
  addStudent: (newStudent: Omit<Student, 'id' | 'habits' | 'avatarUrl'>) => Promise<void>;
  updateStudent: (studentId: string, updatedData: Partial<Omit<Student, 'id' | 'habits' | 'avatarUrl'>>) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  updateHabitScore: (studentId: string, habitId: string, subHabitId: string, newScore: number) => Promise<void>;
  addHabitEntry: (data: Omit<HabitEntry, 'id' | 'timestamp' | 'recordedBy'>) => Promise<void>;
  linkParentToStudent: (studentId: string, parentId: string, parentName: string) => Promise<void>;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider = ({ children }: { children: React.React.ReactNode }) => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

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
      q = query(collection(db, 'students'), where('email', '==', user.email));
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
        score: 4, 
      })),
    }));

    await addDoc(collection(db, 'students'), {
      ...newStudentData,
      habits: initialHabits,
      createdAt: serverTimestamp(),
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

  const deleteStudent = async (studentId: string) => {
    if (!user || userProfile?.role !== 'admin') throw new Error("Authentication required or insufficient permissions");
    const studentDocRef = doc(db, 'students', studentId);
    await deleteDoc(studentDocRef);
  };

  const addHabitEntry = async (data: Omit<HabitEntry, 'id' | 'timestamp' | 'recordedBy'>) => {
    if (!user) throw new Error("Authentication required.");

    const studentDocRef = doc(db, 'students', data.studentId);
    const studentToUpdate = students.find(s => s.id === data.studentId);

    if (!studentToUpdate) {
      throw new Error("Student not found.");
    }
    
    // Deep copy habits to avoid direct state mutation
    const updatedHabits = JSON.parse(JSON.stringify(studentToUpdate.habits || []));

    const habitToUpdate = updatedHabits.find((h: Habit) => h.name === data.habitName);

    if (habitToUpdate) {
       if (!habitToUpdate.subHabits) {
          habitToUpdate.subHabits = [];
       }
       
       let subHabitFound = false;
       habitToUpdate.subHabits = habitToUpdate.subHabits.map((sh: SubHabit) => {
           if (sh.name === data.subHabitName) {
               subHabitFound = true;
               return { ...sh, score: data.score };
           }
           return sh;
       });

       // If sub-habit doesn't exist, create it (should not happen with new structure but good for safety)
       if (!subHabitFound) {
           const subHabitId = `${habitToUpdate.id}-${habitToUpdate.subHabits.length + 1}`;
           habitToUpdate.subHabits.push({ id: subHabitId, name: data.subHabitName, score: data.score });
       }
    }

    await updateDoc(studentDocRef, { habits: updatedHabits });
};


  const updateHabitScore = async (studentId: string, habitId: string, subHabitId: string, newScore: number) => {
    if (!user) throw new Error("Authentication required");

    const studentToUpdate = students.find(s => s.id === studentId);
    if (!studentToUpdate) throw new Error("Student not found");

    const updatedHabits = studentToUpdate.habits.map(habit => {
      if (habit.id === habitId) {
        const updatedSubHabits = (habit.subHabits || []).map(subHabit => {
          if (subHabit.id === subHabitId) {
            return { ...subHabit, score: newScore };
          }
          return subHabit;
        });
        return { ...habit, subHabits: updatedSubHabits };
      }
      return habit;
    });

    const studentDocRef = doc(db, 'students', studentId);
    await updateDoc(studentDocRef, { habits: updatedHabits });
  };
  
  const linkParentToStudent = async (studentId: string, parentId: string, parentName: string) => {
    if (!user || !['admin', 'guru'].includes(userProfile?.role || '')) throw new Error("Authentication required or insufficient permissions");
    const studentDocRef = doc(db, 'students', studentId);
    await updateDoc(studentDocRef, { parentId, parentName });
  }

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const contextValue = {
    students,
    loading,
    addStudent,
    updateStudent,
    deleteStudent,
    updateHabitScore,
    addHabitEntry,
    linkParentToStudent
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

