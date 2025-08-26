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
];

export type UserRole = 'guru' | 'siswa' | 'orangtua';

export interface UserProfile {
    uid: string;
    email: string | null;
    role: UserRole;
    name?: string;
}
