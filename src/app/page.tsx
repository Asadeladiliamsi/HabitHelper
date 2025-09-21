'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Award,
  Users,
  FileText,
  LayoutDashboard,
  BarChart2,
  Bell,
  DownloadCloud,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

const metrics = [
  {
    icon: <CheckCircle className="h-12 w-12 text-primary" />,
    title: 'Tingkat Penyelesaian Kebiasaan',
    description: 'Lacak persentase kebiasaan harian yang berhasil diselesaikan oleh siswa.',
  },
  {
    icon: <TrendingUp className="h-12 w-12 text-primary" />,
    title: 'Tren Kemajuan',
    description: 'Visualisasikan peningkatan dari waktu ke waktu dengan data tren yang jelas dan dapat ditindaklanjuti.',
  },
  {
    icon: <AlertTriangle className="h-12 w-12 text-primary" />,
    title: 'Area untuk Peningkatan',
    description: 'Identifikasi kebiasaan atau area spesifik di mana siswa mungkin memerlukan dukungan ekstra.',
  },
  {
    icon: <Award className="h-12 w-12 text-primary" />,
    title: 'Pencapaian Tonggak Sejarah',
    description: 'Akui dan rayakan pencapaian serta tonggak kemajuan siswa.',
  },
  {
    icon: <Users className="h-12 w-12 text-primary" />,
    title: 'Rata-rata Kelas',
    description: 'Bandingkan kinerja kelas dan identifikasi strategi yang efektif.',
  },
  {
    icon: <FileText className="h-12 w-12 text-primary" />,
    title: 'Laporan yang Dapat Disesuaikan',
    description: 'Hasilkan laporan yang disesuaikan berdasarkan kebutuhan dan parameter spesifik.',
  },
];

const features = [
  {
    icon: <LayoutDashboard className="h-10 w-10 text-primary flex-shrink-0" />,
    title: 'Dasbor Komprehensif',
    description: 'Pusat utama untuk semua kemajuan siswa, pelacakan kebiasaan, dan analitik kinerja.',
  },
  {
    icon: <BarChart2 className="h-10 w-10 text-primary flex-shrink-0" />,
    title: 'Analitik Terperinci',
    description: 'Selami data lebih dalam dengan bagan interaktif dan representasi visual dari perilaku siswa.',
  },
  {
    icon: <Bell className="h-10 w-10 text-primary flex-shrink-0" />,
    title: 'Notifikasi Cerdas',
    description: 'Terima peringatan untuk perubahan signifikan atau area yang memerlukan perhatian.',
  },
  {
    icon: <DownloadCloud className="h-10 w-10 text-primary flex-shrink-0" />,
    title: 'Laporan yang Dapat Diekspor',
    description: 'Unduh dan bagikan laporan kemajuan dengan mudah untuk rapat atau catatan pribadi.',
  },
];


export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="py-6 px-4 sm:px-6 lg:px-8 border-b border-border/40">
        <nav className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
              K
            </span>
            <span className="font-bold text-xl">Kalih.Spensa id</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="#features" className="text-primary font-medium hover:underline hidden sm:block">
              Fitur
            </Link>
            <Link href="/reports" className="text-primary font-medium hover:underline hidden sm:block">
              Laporan
            </Link>
            <Link href="/login">
                <Button className="bg-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300">
                Buka Dashboard
                </Button>
            </Link>
            <ThemeToggle />
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        <section className="text-center py-20 lg:py-32 px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-primary">
            Pantau Kemajuan Siswa dengan Mulus
          </h1>
          <p className="max-w-3xl mx-auto text-lg text-muted-foreground mb-10">
            Kalih.Spensa id menyediakan alat yang kuat bagi para pendidik dan orang tua untuk melacak pengembangan karakter, mengidentifikasi tren, dan membina lingkungan belajar yang mendukung. Dapatkan wawasan berharga tentang kebiasaan dan kemajuan siswa.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/reports">
                <Button size="lg" className="bg-primary hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 duration-300 w-full sm:w-auto">
                    Lihat Laporan Siswa
                </Button>
            </Link>
            <Link href="#features">
                <Button size="lg" variant="outline" className="bg-card hover:bg-muted text-foreground font-bold py-3 px-6 rounded-lg shadow-lg transition-colors duration-300 w-full sm:w-auto">
                    Jelajahi Fitur
                </Button>
            </Link>
          </div>
        </section>

        <section className="py-20 lg:py-24 bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4 text-primary">
                Metrik Pelaporan Utama
              </h2>
              <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
                Pahami kebiasaan inti yang kami lacak untuk membangun pandangan holistik tentang pengembangan karakter siswa.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {metrics.map((metric) => (
                <div key={metric.title} className="bg-background p-8 rounded-lg shadow-md text-center flex flex-col items-center">
                  {metric.icon}
                  <h3 className="text-xl font-semibold mt-4 mb-2">{metric.title}</h3>
                  <p className="text-muted-foreground">{metric.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="py-20 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4 text-primary">
                Fitur untuk Pendidik & Orang Tua
              </h2>
              <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
                Platform kami dibuat untuk menyederhanakan proses pemantauan dan meningkatkan komunikasi antara rumah dan sekolah.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature) => (
                <Card key={feature.title} className="p-8 flex items-center space-x-4">
                  {feature.icon}
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-primary text-primary-foreground py-20 lg:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Siap Meningkatkan Perkembangan Siswa?
            </h2>
            <p className="text-lg mb-10 opacity-90">
              Bergabunglah dengan para pendidik dan orang tua yang memanfaatkan Kalih.Spensa id untuk membangun fondasi yang lebih kuat bagi kesuksesan siswa.
            </p>
            <Link href="/login">
                <Button
                    variant="secondary"
                    size="lg"
                    className="bg-white hover:bg-gray-100 text-primary font-bold py-3 px-8 rounded-full shadow-xl transition-colors duration-300"
                    >
                    Mulai dengan Dasbor Anda
                </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-card py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} Kalih.Spensa id | Memberdayakan Pengembangan Karakter. Hak Cipta Dilindungi Undang-Undang.</p>
        </div>
      </footer>
    </div>
  );
}
