
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { mockStudents } from '@/lib/mock-data';
import type { Student } from '@/lib/types';

interface StudentContextType {
  students: Student[];
  addStudent: (newStudent: Omit<Student, 'id'>) => void;
  updateStudent: (studentId: string, updatedData: Partial<Omit<Student, 'id' | 'habits' | 'avatarUrl'>>) => void;
  deleteStudent: (studentId: string) => void;
  updateHabitScore: (studentId: string, habitId: string, newScore: number) => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider = ({ children }: { children: ReactNode }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedStudents = localStorage.getItem('studentsData');
      if (storedStudents) {
        setStudents(JSON.parse(storedStudents));
      } else {
        setStudents(mockStudents);
      }
    } catch (error) {
      console.error("Failed to parse students from localStorage", error);
      setStudents(mockStudents);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem('studentsData', JSON.stringify(students));
      } catch (error) {
        console.error("Failed to save students to localStorage", error);
      }
    }
  }, [students, isMounted]);


  const addStudent = (newStudentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      id: `student-${Date.now()}`,
      ...newStudentData,
    };
    setStudents((prevStudents) => [...prevStudents, newStudent]);
  };

  const updateStudent = (studentId: string, updatedData: Partial<Omit<Student, 'id' | 'habits' | 'avatarUrl'>>) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.id === studentId ? { ...student, ...updatedData } : student
      )
    );
  };

  const deleteStudent = (studentId: string) => {
    setStudents((prevStudents) =>
      prevStudents.filter((student) => student.id !== studentId)
    );
  };
  
  const updateHabitScore = (studentId: string, habitId: string, newScore: number) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) => {
        if (student.id === studentId) {
          const updatedHabits = student.habits.map((habit) => {
            if (habit.id === habitId) {
              return { ...habit, score: newScore };
            }
            return habit;
          });
          return { ...student, habits: updatedHabits };
        }
        return student;
      })
    );
  };

  if (!isMounted) {
    return null;
  }

  return (
    <StudentContext.Provider value={{ students, addStudent, updateStudent, deleteStudent, updateHabitScore }}>
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
