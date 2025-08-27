'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { mockStudents } from '@/lib/mock-data';
import type { Student } from '@/lib/types';
import { Loader2 } from 'lucide-react';

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
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Menggunakan data mock secara langsung untuk menghindari koneksi ke Firestore
  useEffect(() => {
    setLoading(true);
    // Menambahkan avatar placeholder ke mock data
    const studentsWithAvatars = mockStudents.map(student => ({
      ...student,
      avatarUrl: `https://placehold.co/100x100.png?text=${student.name.charAt(0)}`
    }));
    setStudents(studentsWithAvatars);
    setLoading(false);
  }, []);
  
  // Fungsi-fungsi berikut akan memanipulasi state lokal saja untuk sementara
  const addStudent = async (newStudentData: Omit<Student, 'id' | 'avatarUrl'>) => {
    const newStudent: Student = {
      ...newStudentData,
      id: `student-${Date.now()}`,
      avatarUrl: `https://placehold.co/100x100.png?text=${newStudentData.name.charAt(0)}`,
      habits: [], // Habits akan kosong untuk student baru di mode mock
    };
    setStudents(prev => [...prev, newStudent]);
  };

  const updateStudent = async (studentId: string, updatedData: Partial<Omit<Student, 'id' | 'habits' | 'avatarUrl'>>) => {
     setStudents(prev => 
      prev.map(s => s.id === studentId ? { ...s, ...updatedData } : s)
     );
  };

  const deleteStudent = async (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
  };
  
  const updateHabitScore = async (studentId: string, habitId: string, newScore: number) => {
    setStudents(prev => prev.map(student => {
      if (student.id === studentId) {
        const updatedHabits = student.habits.map(habit => 
          habit.id === habitId ? { ...habit, score: newScore } : habit
        );
        return { ...student, habits: updatedHabits };
      }
      return student;
    }));
  };
  
  const contextValue = { students, loading, addStudent, updateStudent, deleteStudent, updateHabitScore };
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
