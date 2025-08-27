'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, onSnapshot, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { mockStudents } from '@/lib/mock-data';
import type { Student } from '@/lib/types';
import { HABIT_NAMES } from '@/lib/types';
import { useAuth } from './auth-context';

interface StudentContextType {
  students: Student[];
  loading: boolean;
  addStudent: (newStudent: Omit<Student, 'id'>) => Promise<void>;
  updateStudent: (studentId: string, updatedData: Partial<Omit<Student, 'id' | 'habits'>>) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  updateHabitScore: (studentId: string, habitId: string, newScore: number) => Promise<void>;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

const seedInitialData = async () => {
  const studentsCollection = collection(db, 'students');
  const snapshot = await getDocs(studentsCollection);
  if (snapshot.empty) {
    console.log('No students found, seeding initial data...');
    const batch = writeBatch(db);
    mockStudents.forEach((student) => {
      const docRef = doc(db, 'students', student.id);
      batch.set(docRef, student);
    });
    await batch.commit();
    console.log('Initial data seeded.');
  } else {
    console.log('Students collection is not empty, skipping seed.');
  }
};

export const StudentProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      // Tunggu hingga status autentikasi selesai dimuat
      setLoading(true);
      return;
    }

    if (!user) {
      // Jika tidak ada pengguna, reset state dan hentikan
      setStudents([]);
      setLoading(false);
      return;
    }
    
    // Seed data on initial load if necessary
    seedInitialData();

    const unsubscribe = onSnapshot(collection(db, 'students'), (snapshot) => {
      const studentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
      setStudents(studentsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching students from Firestore:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);
  
  const addStudent = async (newStudentData: Omit<Student, 'id'>) => {
    const studentId = `student-${Date.now()}`;
    const newStudent: Student = {
      id: studentId,
      habits: HABIT_NAMES.map((name, index) => ({
          id: `habit-${index + 1}`,
          name: name,
          score: 8, // Default score
      })),
      ...newStudentData,
    };
    try {
      await setDoc(doc(db, 'students', studentId), newStudent);
    } catch (error) {
      console.error("Error adding student: ", error);
    }
  };

  const updateStudent = async (studentId: string, updatedData: Partial<Omit<Student, 'id' | 'habits'>>) => {
     try {
      const studentDocRef = doc(db, 'students', studentId);
      await setDoc(studentDocRef, updatedData, { merge: true });
    } catch (error) {
      console.error("Error updating student: ", error);
    }
  };

  const deleteStudent = async (studentId: string) => {
    try {
      await deleteDoc(doc(db, 'students', studentId));
    } catch (error) {
      console.error("Error deleting student: ", error);
    }
  };
  
  const updateHabitScore = async (studentId: string, habitId: string, newScore: number) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const updatedHabits = student.habits.map(habit => 
      habit.id === habitId ? { ...habit, score: newScore } : habit
    );
    
    try {
        const studentDocRef = doc(db, 'students', studentId);
        await setDoc(studentDocRef, { habits: updatedHabits }, { merge: true });
    } catch (error) {
        console.error("Error updating habit score: ", error);
    }
  };
  
  return (
    <StudentContext.Provider value={{ students, loading, addStudent, updateStudent, deleteStudent, updateHabitScore }}>
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
