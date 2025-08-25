import type { Student, Habit } from '@/lib/types';
import { HABIT_NAMES } from '@/lib/types';

const staticScores: { [key: string]: number[] } = {
  'student-1': [10, 8, 9, 7, 8, 10, 9],
  'student-2': [8, 9, 7, 10, 8, 9, 7],
  'student-3': [9, 7, 10, 8, 9, 7, 8],
  'student-4': [7, 10, 8, 9, 7, 8, 10],
  'student-5': [10, 8, 9, 7, 10, 9, 8],
};

const createHabits = (studentId: string): Habit[] => {
  return HABIT_NAMES.map((name, index) => ({
    id: `habit-${index + 1}`,
    name: name,
    score: staticScores[studentId][index] || 8,
  }));
};

export const mockStudents: Student[] = [
  {
    id: 'student-1',
    name: 'Ahmad Budi',
    avatarUrl: 'https://placehold.co/100x100.png',
    class: 'IX A',
    habits: createHabits('student-1'),
  },
  {
    id: 'student-2',
    name: 'Citra Lestari',
    avatarUrl: 'https://placehold.co/100x100.png',
    class: 'IX B',
    habits: createHabits('student-2'),
  },
  {
    id: 'student-3',
    name: 'Dewi Anggraini',
    avatarUrl: 'https://placehold.co/100x100.png',
    class: 'IX A',
    habits: createHabits('student-3'),
  },
  {
    id: 'student-4',
    name: 'Eka Wijaya',
    avatarUrl: 'https://placehold.co/100x100.png',
    class: 'IX C',
    habits: createHabits('student-4'),
  },
  {
    id: 'student-5',
    name: 'Fajar Nugroho',
    avatarUrl: 'https://placehold.co/100x100.png',
    class: 'IX B',
    habits: createHabits('student-5'),
  },
];

export const overallHabitData = HABIT_NAMES.map(name => ({
  name,
  'Minggu Ini': Math.floor(Math.random() * 20) + 75,
  'Minggu Lalu': Math.floor(Math.random() * 20) + 70,
}));
