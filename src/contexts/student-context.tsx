'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Student } from '@/lib/types';
import { useAuth } from './auth-context';
import { HABIT_NAMES } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface StudentContextType {
  students: Student[];
  loading: boolean;
  addStudent: (newStudent: Omit<Student, 'id' | 'habits' | 'avatarUrl'>) => Promise<void>;
  updateStudent: (studentId: string, updatedData: Partial<Omit<Student, 'id' | 'habits' | 'avatarUrl'>>) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  updateHabitScore: (studentId: string, habitId: string, newScore: number) => Promise<void>;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider = ({ children }: { children: ReactNode }) => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user || !userProfile) {
      setLoading(true);
      return;
    }

    const q = query(collection(db, 'students'));

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
    try {
      await addDoc(collection(db, 'students'), {
        ...newStudentData,
        habits: HABIT_NAMES.map((name, index) => ({
          id: `habit-${index + 1}`,
          name: name,
          score: 4,
        })),
        avatarUrl: `https://placehold.co/100x100.png?text=${newStudentData.name.charAt(0)}`,
        createdBy: user.uid,
      });
    } catch (error) {
      console.error("Error adding student:", error);
    }
  };

  const updateStudent = async (studentId: string, updatedData: Partial<Omit<Student, 'id' | 'habits' | 'avatarUrl'>>) => {
    if (!user) throw new Error("Authentication required");
    const studentDocRef = doc(db, 'students', studentId);
    try {
      await updateDoc(studentDocRef, updatedData);
    } catch (error) {
      console.error("Error updating student:", error);
    }
  };

  const deleteStudent = async (studentId: string) => {
    if (!user) throw new Error("Authentication required");
    const studentDocRef = doc(db, 'students', studentId);
    try {
      await deleteDoc(studentDocRef);
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  const updateHabitScore = async (studentId: string, habitId: string, newScore: number) => {
    if (!user) throw new Error("Authentication required");
    const studentToUpdate = students.find(s => s.id === studentId);
    if (studentToUpdate) {
      const updatedHabits = studentToUpdate.habits.map(habit =>
        habit.id === habitId ? { ...habit, score: newScore } : habit
      );
      const studentDocRef = doc(db, 'students', studentId);
      try {
        await updateDoc(studentDocRef, { habits: updatedHabits });
      } catch (error) {
        console.error("Error updating habit score:", error);
      }
    }
  };
  
  if (loading) {
    return (
     <div className="flex h-screen items-center justify-center">
       <Loader2 className="h-8 w-8 animate-spin" />
     </div>
   );
 }

  const contextValue = { students, loading, addStudent, updateStudent, deleteStudent, updateHabitScore };

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
