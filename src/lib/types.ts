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
  'Proaktif',
  'Mulai dengan Tujuan Akhir',
  'Dahulukan yang Utama',
  'Berpikir Menang-Menang',
  'Berusaha Mengerti Dahulu, Baru Dimengerti',
  'Wujudkan Sinergi',
  'Asah Gergaji',
];
