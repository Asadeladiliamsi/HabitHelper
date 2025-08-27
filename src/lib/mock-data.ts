import type { Student, Habit } from '@/lib/types';
import { HABIT_NAMES } from '@/lib/types';

const staticScores: { [key: string]: number[] } = {
  'student-1': [4, 3, 4, 3, 4, 4, 4],
  'student-2': [3, 4, 3, 4, 3, 4, 3],
  'student-3': [4, 3, 4, 3, 4, 3, 4],
  'student-4': [3, 4, 3, 4, 3, 4, 3],
  'student-5': [4, 3, 4, 3, 4, 4, 4],
};

const createHabits = (studentId: string): Habit[] => {
  return HABIT_NAMES.map((name, index) => ({
    id: `habit-${index + 1}`,
    name: name,
    score: staticScores[studentId]?.[index] || 3,
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

export const overallHabitData = [
  { name: 'Bangun Pagi', 'Minggu Ini': 88, 'Minggu Lalu': 82 },
  { name: 'Taat Beribadah', 'Minggu Ini': 92, 'Minggu Lalu': 90 },
  { name: 'Rajin Olahraga', 'Minggu Ini': 85, 'Minggu Lalu': 88 },
  { name: 'Makan Sehat & Bergizi', 'Minggu Ini': 95, 'Minggu Lalu': 91 },
  { name: 'Gemar Belajar', 'Minggu Ini': 89, 'Minggu Lalu': 85 },
  { name: 'Bermasyarakat', 'Minggu Ini': 91, 'Minggu Lalu': 93 },
  { name: 'Tidur Cepat', 'Minggu Ini': 87, 'Minggu Lalu': 89 },
];
