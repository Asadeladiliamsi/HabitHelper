'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Zap, Target, ListChecks, Handshake, Ear, Combine, HeartPulse, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/icons/logo';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const habits = [
  {
    icon: <Zap className="h-8 w-8 text-accent" />,
    name: 'Proaktif',
    description: 'Mengambil inisiatif dan bertanggung jawab atas pilihan.',
    translationKey: 'proactive'
  },
  {
    icon: <Target className="h-8 w-8 text-accent" />,
    name: 'Mulai dengan Tujuan Akhir',
    description: 'Menetapkan tujuan dan visi untuk masa depan.',
    translationKey: 'beginWithEnd'
  },
  {
    icon: <ListChecks className="h-8 w-8 text-accent" />,
    name: 'Dahulukan yang Utama',
    description: 'Memprioritaskan hal-hal yang paling penting.',
    translationKey: 'firstThingsFirst'
  },
  {
    icon: <Handshake className="h-8 w-8 text-accent" />,
    name: 'Berpikir Menang-Menang',
    description: 'Mencari solusi yang menguntungkan semua pihak.',
    translationKey: 'thinkWinWin'
  },
  {
    icon: <Ear className="h-8 w-8 text-accent" />,
    name: 'Berusaha Mengerti Dahulu',
    description: 'Mendengarkan dengan empati untuk memahami orang lain.',
    translationKey: 'seekFirstToUnderstand'
  },
  {
    icon: <Combine className="h-8 w-8 text-accent" />,
    name: 'Wujudkan Sinergi',
    description: 'Bekerja sama untuk mencapai hasil yang lebih baik.',
    translationKey: 'synergize'
  },
  {
    icon: <HeartPulse className="h-8 w-8 text-accent" />,
    name: 'Asah Gergaji',
    description: 'Memperbaharui diri secara terus-menerus.',
    translationKey: 'sharpenTheSaw'
  },
];

const features = [
  {
    name: 'Dashboard Monitoring',
    description: 'Visualisasikan kemajuan siswa dengan grafik interaktif dan laporan ringkas.',
    icon: <CheckCircle className="h-6 w-6 text-primary" />,
    translationKey: 'monitoringDashboard'
  },
  {
    name: 'Input Data Harian',
    description: 'Guru dapat dengan mudah mencatat perkembangan kebiasaan siswa setiap hari.',
    icon: <CheckCircle className="h-6 w-6 text-primary" />,
    translationKey: 'dailyDataInput'
  },
  {
    name: 'Notifikasi AI Cerdas',
    description: 'Dapatkan pemberitahuan otomatis jika ada penurunan kebiasaan siswa.',
    icon: <CheckCircle className="h-6 w-6 text-primary" />,
    translationKey: 'smartAINotifications'
  },
  {
    name: 'Laporan Komprehensif',
    description: 'Ekspor data perkembangan siswa untuk evaluasi dan pelaporan.',
    icon: <CheckCircle className="h-6 w-6 text-primary" />,
    translationKey: 'comprehensiveReports'
  },
];

export default function LandingPage() {
  const { language } = useLanguage();
  const t = translations[language]?.landingPage || translations.en.landingPage;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
            <span className="font-bold text-xl text-primary">HabitHelper</span>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                {t.openDashboard}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/guru/dashboard">Guru</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/siswa/dashboard">Siswa</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/orangtua/dashboard">Orang Tua</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 md:py-32">
          <div className="container max-w-7xl text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl">
              {t.heroTitle}
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground md:text-xl">
              {t.heroSubtitle}
            </p>
            <div className="mt-10 flex justify-center gap-4">
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="lg">
                    {t.viewDemo}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                  <DropdownMenuItem asChild>
                    <Link href="/guru/dashboard">Guru</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/siswa/dashboard">Siswa</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orangtua/dashboard">Orang Tua</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </section>

        <section id="habits" className="py-20 md:py-24 bg-card border-y">
          <div className="container max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="font-headline text-3xl font-bold text-primary sm:text-4xl">{t.habitsTitle}</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {t.habitsSubtitle}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {habits.map((habit) => (
                <div key={habit.name} className="flex flex-col items-center text-center p-6 rounded-lg">
                  {habit.icon}
                  <h3 className="mt-4 font-bold text-xl text-primary">{t.habits[habit.translationKey].name}</h3>
                  <p className="mt-2 text-muted-foreground">{t.habits[habit.translationKey].description}</p>
                </div>
              ))}
               <div className="hidden xl:flex flex-col items-center text-center p-6 rounded-lg"></div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 md:py-24">
          <div className="container max-w-7xl">
            <div className="text-center mb-12">
                <h2 className="font-headline text-3xl font-bold text-primary sm:text-4xl">{t.featuresTitle}</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                    {t.featuresSubtitle}
                </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {features.map((feature) => (
                <Card key={feature.name} className="p-6">
                  <div className="flex items-start gap-4">
                    {feature.icon}
                    <div>
                      <h3 className="font-bold text-xl text-primary">{t.features[feature.translationKey].name}</h3>
                      <p className="mt-1 text-muted-foreground">{t.features[feature.translationKey].description}</p>
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
          <p>&copy; {new Date().getFullYear()} {t.footer}</p>
        </div>
      </footer>
    </div>
  );
}
