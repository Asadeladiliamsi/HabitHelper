'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { mockStudents } from '@/lib/mock-data';
import type { Student } from '@/lib/types';
import { useAuth } from './auth-context';

interface StudentContextType {
  students: Student[];
  loading: boolean;
  addStudent: (newStudent: Omit<Student, 'id' | 'avatarUrl'>) => Promise<void>;
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
    // Wait for auth to finish and user profile to be loaded.
    if (authLoading || !user || !userProfile) {
      setLoading(true);
      return;
    }

    const studentsCollectionRef = collection(db, 'students');

    const unsubscribe = onSnapshot(studentsCollectionRef, async (snapshot) => {
        if (snapshot.empty && user) {
            console.log('No students found. Seeding initial mock data...');
            setLoading(true);
            try {
                const batch = writeBatch(db);
                mockStudents.forEach((student) => {
                    const studentWithPlaceholderAvatar = {
                      ...student,
                      avatarUrl: `https://placehold.co/100x100.png?text=${student.name.charAt(0)}`
                    };
                    const docRef = doc(db, 'students', student.id);
                    batch.set(docRef, studentWithPlaceholderAvatar);
                });
                await batch.commit();
                console.log('Mock data seeded successfully.');
                // Snapshot will re-fire with the new data, so we don't set loading to false here.
            } catch(error) {
                console.error("Error seeding data:", error);
                setLoading(false);
            }
        } else {
            const studentsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
            setStudents(studentsList);
            setLoading(false);
        }
    }, (error) => {
        console.error("Error fetching students:", error);
        setStudents([]); // Clear students on error
        setLoading(false);
    });

    return () => {
      unsubscribe();
      setStudents([]); // Clear students on unmount/logout
      setLoading(true); // Reset loading state
    };
  }, [user, userProfile, authLoading]);
  
  const addStudent = async (newStudentData: Omit<Student, 'id' | 'avatarUrl'>) => {
    if (!user) {
      console.error("No user logged in to add student.");
      return;
    }
    const studentId = `student-${Date.now()}`;
    const newStudent: Student = {
      id: studentId,
      ...newStudentData,
      avatarUrl: `https://placehold.co/100x100.png?text=${newStudentData.name.charAt(0)}`,
    };
    try {
      const studentDocRef = doc(db, 'students', studentId);
      await setDoc(studentDocRef, newStudent);
    } catch (error) {
      console.error("Error adding student: ", error);
    }
  };

  const updateStudent = async (studentId: string, updatedData: Partial<Omit<Student, 'id' | 'habits' | 'avatarUrl'>>) => {
     if (!user) return;
     try {
      const studentDocRef = doc(db, 'students', studentId);
      await updateDoc(studentDocRef, updatedData);
    } catch (error) {
      console.error("Error updating student: ", error);
    }
  };

  const deleteStudent = async (studentId: string) => {
    if (!user) return;
    try {
      const studentDocRef = doc(db, 'students', studentId);
      await deleteDoc(studentDocRef);
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
        await updateDoc(studentDocRef, { habits: updatedHabits });
    } catch (error) {
        console.error("Error updating habit score: ", error);
    }
  };
  
  return (
    <StudentContext.Provider value={{ students, loading, addStudent, updateStudent, deleteStudent, updateHabitScore }}>
      {loading ? (
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : children}
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
