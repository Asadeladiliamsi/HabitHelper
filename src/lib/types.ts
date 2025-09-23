
import type { Timestamp, DocumentData } from 'firebase/firestore';

export interface SubHabit {
  id: string;
  name: string;
  score: number;
}

export interface Habit {
  id: string;
  name: string;
  subHabits: SubHabit[];
}

export interface Student extends DocumentData {
  id: string;
  name: string;
  nisn: string;
  email: string;
  avatarUrl: string;
  class: string;
  habits: Habit[];
  parentId?: string;
  parentName?: string;
  linkedUserUid?: string;
}

export const HABIT_DEFINITIONS: Record<string, string[]> = {
  'Bangun Pagi': [
    'Bangun pagi dengan segar dan tidak merasa lelah.',
    'Memiliki jadwal bangun yang konsisten setiap hari.',
    'Memilih untuk tidur lebih awal agar dapat bangun lebih pagi.',
  ],
  'Taat Beribadah': [
    'Melaksanakan ibadah wajib tepat waktu.',
    'Menunjukkan sikap khusyuk saat beribadah.',
    'Menambah dengan ibadah sunnah.',
  ],
  'Rajin Olahraga': [
    'Melakukan aktivitas fisik secara teratur (min. 3x seminggu).',
    'Menunjukkan semangat saat berolahraga.',
    'Memahami pentingnya olahraga bagi kesehatan.',
  ],
  'Makan Sehat & Bergizi': [
    'Mengonsumsi variasi makanan (sayur, buah, protein).',
    'Menghindari makanan cepat saji berlebihan.',
    'Minum air putih yang cukup.',
  ],
  'Gemar Belajar': [
    'Mengerjakan tugas sekolah dengan tuntas.',
    'Aktif bertanya atau berdiskusi di kelas.',
    'Membaca buku atau sumber ilmu di luar pelajaran.',
  ],
  'Bermasyarakat': [
    'Menyapa guru dan teman dengan sopan.',
    'Ikut serta dalam kegiatan sosial atau kerja kelompok.',
    'Menawarkan bantuan kepada teman yang membutuhkan.',
  ],
  'Tidur Cepat': [
    'Kepatuhan terhadap Waktu Tidur',
    'Durasi Tidur yang Cukup',
    'Kualitas Tidur',
    'Menghindari Aktivitas yang Mengganggu Tidur',
    'Rutinitas Persiapan Tidur',
    'Kebiasaan Bangun Pagi',
    'Konsistensi Jadwal Tidur',
    'Manajemen Waktu untuk Tidur',
    'Sikap Positif terhadap Tidur',
    'Dampak Tidur pada Aktivitas Harian',
  ]
};

export const HABIT_NAMES = Object.keys(HABIT_DEFINITIONS);


export type UserRole = 'guru' | 'siswa' | 'orangtua' | 'admin';

export interface UserProfile {
  uid: string;
  email: string | null;
  name: string;
  role: UserRole;
  nisn?: string;
}

export interface HabitEntry {
  id: string;
  studentId: string;
  habitName: string; // Nama kebiasaan utama
  subHabitName: string; // Nama sub-kebiasaan/aspek
  score: number;
  date: Date;
  recordedBy: string; // UID of the teacher
  timestamp: Timestamp;
}
