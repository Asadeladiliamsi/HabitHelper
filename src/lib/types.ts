import type { Timestamp } from 'firebase/firestore';

export interface Habit {
  id: string;
  name: string;
  score: number;
}

export interface Student {
  id: string;
  name: string;
  avatarUrl: string;
  class: string;
  habits: Habit[];
}

export const HABIT_NAMES = [
  'Bangun Pagi',
  'Taat Beribadah',
  'Rajin Olahraga',
  'Makan Sehat & Bergizi',
  'Gemar Belajar',
  'Bermasyarakat',
  'Tidur Cepat',
];

export type UserRole = 'guru' | 'siswa' | 'orangtua' | 'admin';

export interface UserProfile {
  uid: string;
  email: string | null;
  name: string;
  role: UserRole;
}

export interface HabitEntry {
  id: string;
  studentId: string;
  habitName: string;
  score: number;
  date: Date;
  recordedBy: string; // UID of the teacher
  timestamp: Timestamp;
}
