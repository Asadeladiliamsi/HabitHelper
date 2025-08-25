import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Zap, Target, ListChecks, Handshake, Ear, Combine, HeartPulse, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/icons/logo';

const habits = [
  {
    icon: <Zap className="h-8 w-8 text-accent" />,
    name: 'Proaktif',
    description: 'Mengambil inisiatif dan bertanggung jawab atas pilihan.',
  },
  {
    icon: <Target className="h-8 w-8 text-accent" />,
    name: 'Mulai dengan Tujuan Akhir',
    description: 'Menetapkan tujuan dan visi untuk masa depan.',
  },
  {
    icon: <ListChecks className="h-8 w-8 text-accent" />,
    name: 'Dahulukan yang Utama',
    description: 'Memprioritaskan hal-hal yang paling penting.',
  },
  {
    icon: <Handshake className="h-8 w-8 text-accent" />,
    name: 'Berpikir Menang-Menang',
    description: 'Mencari solusi yang menguntungkan semua pihak.',
  },
  {
    icon: <Ear className="h-8 w-8 text-accent" />,
    name: 'Berusaha Mengerti Dahulu',
    description: 'Mendengarkan dengan empati untuk memahami orang lain.',
  },
  {
    icon: <Combine className="h-8 w-8 text-accent" />,
    name: 'Wujudkan Sinergi',
    description: 'Bekerja sama untuk mencapai hasil yang lebih baik.',
  },
  {
    icon: <HeartPulse className="h-8 w-8 text-accent" />,
    name: 'Asah Gergaji',
    description: 'Memperbaharui diri secara terus-menerus.',
  },
];

const features = [
  {
    name: 'Dashboard Monitoring',
    description: 'Visualisasikan kemajuan siswa dengan grafik interaktif dan laporan ringkas.',
    icon: <CheckCircle className="h-6 w-6 text-primary" />,
  },
  {
    name: 'Input Data Harian',
    description: 'Guru dapat dengan mudah mencatat perkembangan kebiasaan siswa setiap hari.',
    icon: <CheckCircle className="h-6 w-6 text-primary" />,
  },
  {
    name: 'Notifikasi AI Cerdas',
    description: 'Dapatkan pemberitahuan otomatis jika ada penurunan kebiasaan siswa.',
    icon: <CheckCircle className="h-6 w-6 text-primary" />,
  },
  {
    name: 'Laporan Komprehensif',
    description: 'Ekspor data perkembangan siswa untuk evaluasi dan pelaporan.',
    icon: <CheckCircle className="h-6 w-6 text-primary" />,
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
            <span className="font-bold text-xl text-primary">HabitHelper</span>
          </Link>
          <Button asChild>
            <Link href="/login">
              Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 md:py-32">
          <div className="container max-w-7xl text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl">
              Membentuk Karakter Hebat, Satu Kebiasaan Setiap Hari
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground md:text-xl">
              HabitHelper adalah platform digital untuk memantau program "7 Kebiasaan Anak Indonesia Hebat" di SMPN 1 Sampit, membantu guru dan orang tua membimbing siswa menjadi pribadi yang unggul.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/register">Mulai Sekarang</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="habits" className="py-20 md:py-24 bg-card border-y">
          <div className="container max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="font-headline text-3xl font-bold text-primary sm:text-4xl">7 Kebiasaan Anak Indonesia Hebat</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Landasan untuk membangun karakter siswa yang proaktif, bertanggung jawab, dan kolaboratif.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {habits.map((habit) => (
                <div key={habit.name} className="flex flex-col items-center text-center p-6 rounded-lg">
                  {habit.icon}
                  <h3 className="mt-4 font-bold text-xl text-primary">{habit.name}</h3>
                  <p className="mt-2 text-muted-foreground">{habit.description}</p>
                </div>
              ))}
               <div className="hidden xl:flex flex-col items-center text-center p-6 rounded-lg"></div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 md:py-24">
          <div className="container max-w-7xl">
            <div className="text-center mb-12">
                <h2 className="font-headline text-3xl font-bold text-primary sm:text-4xl">Fitur Unggulan Kami</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                    Dirancang untuk mendukung ekosistem pendidikan yang efektif dan kolaboratif.
                </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {features.map((feature) => (
                <Card key={feature.name} className="p-6">
                  <div className="flex items-start gap-4">
                    {feature.icon}
                    <div>
                      <h3 className="font-bold text-xl text-primary">{feature.name}</h3>
                      <p className="mt-1 text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container max-w-7xl text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} HabitHelper | SMPN 1 Sampit. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
