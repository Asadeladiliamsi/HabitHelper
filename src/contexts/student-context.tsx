'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, onSnapshot, writeBatch } from 'firebase/firestore';
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

export const StudentProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (!user) {
      setStudents([]); // Clear data when user logs out
      setLoading(false);
      return;
    }

    const studentsCollection = collection(db, 'students');
    const unsubscribe = onSnapshot(studentsCollection, async (snapshot) => {
      if (snapshot.empty) {
        console.log('No students found in Firestore for this user. Seeding initial mock data...');
        const batch = writeBatch(db);
        mockStudents.forEach((student) => {
          const docRef = doc(db, 'students', student.id);
          batch.set(docRef, student);
        });
        try {
            await batch.commit();
            // Firestore will trigger a new snapshot after commit, which will then populate the state.
        } catch (error) {
            console.error("Error seeding initial data:", error);
            setLoading(false); // Stop loading even if seeding fails
        }
      } else {
         const studentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
         setStudents(studentsData);
         setLoading(false);
      }
    }, (error) => {
      console.error("Error fetching students from Firestore:", error);
      setStudents(mockStudents); // Fallback to mock data on error
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);
  
  const addStudent = async (newStudentData: Omit<Student, 'id'>) => {
    if (!user) {
      console.error("No user logged in to add student.");
      return;
    }
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
      const studentDocRef = doc(db, 'students', studentId);
      await writeBatch(db).set(studentDocRef, newStudent).commit();
    } catch (error) {
      console.error("Error adding student: ", error);
    }
  };

  const updateStudent = async (studentId: string, updatedData: Partial<Omit<Student, 'id' | 'habits'>>) => {
     if (!user) return;
     try {
      const studentDocRef = doc(db, 'students', studentId);
      await writeBatch(db).set(studentDocRef, updatedData, { merge: true }).commit();
    } catch (error) {
      console.error("Error updating student: ", error);
    }
  };

  const deleteStudent = async (studentId: string) => {
    if (!user) return;
    try {
      const studentDocRef = doc(db, 'students', studentId);
      await writeBatch(db).delete(studentDocRef).commit();
    } catch (error) {
      console.error("Error deleting student: ", error);
    }
  };
  
  const updateHabitScore = async (studentId: string, habitId: string, newScore: number) => {
    if (!user) return;
    const studentToUpdate = students.find(s => s.id === studentId);
    if (!studentToUpdate) return;

    const updatedHabits = studentToUpdate.habits.map(habit => 
      habit.id === habitId ? { ...habit, score: newScore } : habit
    );
    
    try {
        const studentDocRef = doc(db, 'students', studentId);
        await writeBatch(db).set(studentDocRef, { habits: updatedHabits }, { merge: true }).commit();
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
