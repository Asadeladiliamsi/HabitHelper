
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
    'Kedisiplinan Waktu Ibadah',
    'Kualitas Ibadah',
    'Ketekunan dalam Beribadah',
    'Keseriusan dengan Ibadah Khusyuk',
    'Kepatuhan terhadap Doa dan Dzikir',
    'Ketertiban dalam Kegiatan Keagamaan',
    'Tingkat Kebersihan Diri dalam Kegiatan Ibadah',
    'Penghayatan Nilai-nilai Agama',
    'Kebermaknaan dalam Beribadah',
    'Sikap Hormat dan Toleransi',
  ],
  'Rajin Olahraga': [
    'Melakukan aktivitas fisik secara teratur (min. 3x seminggu).',
    'Menunjukkan semangat saat berolahraga.',
    'Memahami pentingnya olahraga bagi kesehatan.',
  ],
  'Makan Sehat & Bergizi': [
    'Keteraturan Makan',
    'Pemilihan Makanan',
    'Keseimbangan Nutrisi',
    'Hindari Makanan Tidak Sehat',
    'Ukuran Porsi yang Sesuai',
    'Kebiasaan Minum Air Putih',
    'Konsumsi Buah dan Sayur',
    'Kebersihan Saat Makan',
    'Kesadaran Gizi',
    'Kemandirian dalam Memilih Makanan',
  ],
  'Gemar Belajar': [
    'Keterlibatan dalam Pembelajaran',
    'Kemandirian dalam Belajar',
    'Ketertarikan terhadap Materi Belajar',
    'Penggunaan Waktu Belajar',
    'Konsistensi dalam Belajar',
    'Pencapaian Prestasi Akademik',
    'Disiplin terhadap Tugas Akademik',
    'Sikap terhadap Bantuan Akademik',
    'Kreativitas dalam Belajar',
    'Kemampuan Berpikir Kritis',
  ],
  'Bermasyarakat': [
    'Keterlibatan dalam Kegiatan Sosial',
    'Sikap Gotong Royong',
    'Tanggung Jawab Sosial',
    'Sikap Empati',
    'Sikap Toleransi',
    'Kepedulian terhadap Lingkungan',
    'Komunikasi yang Baik dengan Teman dan Masyarakat',
    'Sikap Positif terhadap Aturan Sekolah dan Lingkungan',
    'Partisipasi dalam Kegiatan Sekolah',
    'Kepemimpinan dalam Kegiatan Sosial',
  ],
  'Tidur Cepat': [
    'Kepatuhan terhadap Waktu Tidur',
    'Durasi Tidur yang Cukup',
    'Kualitas Tidur',
    'Menghindari Aktivitas yang Mengganggu Tidur',
    'Memiliki rutinitas yang menenangkan sebelum tidur, seperti membaca atau berdoa.',
    'Bangun pagi dengan segar dan tidak merasa lelah.',
    'Memiliki jadwal tidur yang konsisten setiap hari.',
    'Memilih untuk tidur lebih awal agar dapat bangun lebih pagi.',
    'Menunjukkan sikap positif terhadap tidur dan memahami pentingnya tidur yang cukup.',
    'Menjaga kesehatan dan dapat menjalani aktivitas dengan baik setelah tidur yang cukup.',
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
