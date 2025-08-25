import type { Student, Habit } from '@/lib/types';
import { HABIT_NAMES } from '@/lib/types';

const createHabits = (): Habit[] => {
  return HABIT_NAMES.map((name, index) => ({
    id: `habit-${index + 1}`,
    name: name,
    score: Math.floor(Math.random() * 4) + 7, // Score between 7 and 10
  }));
};

export const mockStudents: Student[] = [
  {
    id: 'student-1',
    name: 'Ahmad Budi',
    avatarUrl: 'https://placehold.co/100x100.png',
    class: 'IX A',
    habits: createHabits(),
  },
  {
    id: 'student-2',
    name: 'Citra Lestari',
    avatarUrl: 'https://placehold.co/100x100.png',
    class: 'IX B',
    habits: createHabits(),
  },
  {
    id: 'student-3',
    name: 'Dewi Anggraini',
    avatarUrl: 'https://placehold.co/100x100.png',
    class: 'IX A',
    habits: createHabits(),
  },
  {
    id: 'student-4',
    name: 'Eka Wijaya',
    avatarUrl: 'https://placehold.co/100x100.png',
    class: 'IX C',
    habits: createHabits(),
  },
  {
    id: 'student-5',
    name: 'Fajar Nugroho',
    avatarUrl: 'https://placehold.co/100x100.png',
    class: 'IX B',
    habits: createHabits(),
  },
];

export const overallHabitData = HABIT_NAMES.map(name => ({
  name,
  'Minggu Ini': Math.floor(Math.random() * 20) + 75,
  'Minggu Lalu': Math.floor(Math.random() * 20) + 70,
}));
