'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, set, update, remove } from 'firebase/database';
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

    const studentsRef = ref(db, 'students');
    const unsubscribe = onValue(studentsRef, async (snapshot) => {
      if (snapshot.exists()) {
        const studentsData = snapshot.val();
        const studentsList = Object.keys(studentsData).map(key => ({
          id: key,
          ...studentsData[key],
        }));
        setStudents(studentsList);
      } else {
        console.log('No students found in Realtime Database. Seeding initial mock data...');
        const initialData = mockStudents.reduce((acc, student) => {
          acc[student.id] = student;
          return acc;
        }, {} as Record<string, Student>);

        try {
          await set(studentsRef, initialData);
          // onValue will be triggered again by the set operation, which will then populate the state
        } catch (error) {
          console.error("Error seeding initial data:", error);
          setStudents([]); // Set to empty if seeding fails
        }
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching students from Realtime Database:", error);
      setStudents([]); // Fallback to empty data on error
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
      const studentRef = ref(db, `students/${studentId}`);
      await set(studentRef, newStudent);
    } catch (error) {
      console.error("Error adding student: ", error);
    }
  };

  const updateStudent = async (studentId: string, updatedData: Partial<Omit<Student, 'id' | 'habits'>>) => {
     if (!user) return;
     try {
      const studentRef = ref(db, `students/${studentId}`);
      await update(studentRef, updatedData);
    } catch (error) {
      console.error("Error updating student: ", error);
    }
  };

  const deleteStudent = async (studentId: string) => {
    if (!user) return;
    try {
      const studentRef = ref(db, `students/${studentId}`);
      await remove(studentRef);
    } catch (error) {
      console.error("Error deleting student: ", error);
    }
  };
  
  const updateHabitScore = async (studentId: string, habitId: string, newScore: number) => {
    if (!user) return;
    const studentToUpdate = students.find(s => s.id === studentId);
    if (!studentToUpdate) return;

    const habitIndex = studentToUpdate.habits.findIndex(habit => habit.id === habitId);
    if (habitIndex === -1) return;
    
    try {
        const habitScoreRef = ref(db, `students/${studentId}/habits/${habitIndex}/score`);
        await set(habitScoreRef, newScore);
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
