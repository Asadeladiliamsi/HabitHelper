
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Sunrise, BookOpen, HeartPulse, Users, TrendingUp, Activity, ArrowRight, Utensils, HandHelping, Church, Bed } from 'lucide-react';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';
import Image from 'next/image';

const habits = [
  {
    icon: <Sunrise className="h-8 w-8 text-accent" />,
    name: 'Bangun Pagi',
    description: 'Memulai hari lebih awal untuk produktivitas.',
    translationKey: 'bangunPagi'
  },
  {
    icon: <Church className="h-8 w-8 text-accent" />,
    name: 'Taat Beribadah',
    description: 'Menjalankan kewajiban spiritual dengan rutin.',
    translationKey: 'taatBeribadah'
  },
  {
    icon: <HeartPulse className="h-8 w-8 text-accent" />,
    name: 'Rajin Olahraga',
    description: 'Menjaga kesehatan dan kebugaran jasmani.',
    translationKey: 'rajinOlahraga'
  },
  {
    icon: <Utensils className="h-8 w-8 text-accent" />,
    name: 'Makan Sehat & Bergizi',
    description: 'Mengonsumsi makanan yang baik untuk tubuh.',
    translationKey: 'makanSehat'
  },
  {
    icon: <BookOpen className="h-8 w-8 text-accent" />,
    name: 'Gemar Belajar',
    description: 'Memiliki semangat untuk terus menambah ilmu.',
    translationKey: 'gemarBelajar'
  },
  {
    icon: <HandHelping className="h-8 w-8 text-accent" />,
    name: 'Bermasyarakat',
    description: 'Berinteraksi dan berkontribusi di lingkungan sosial.',
    translationKey: 'bermasyarakat'
  },
  {
    icon: <Bed className="h-8 w-8 text-accent" />,
    name: 'Tidur Cepat',
    description: 'Istirahat yang cukup untuk pemulihan tubuh.',
    translationKey: 'tidurCepat'
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
            
            <span className="font-bold text-xl text-primary">Kaih.Spensa id</span>
          </Link>
          <Link href="/login">
            <Button>
              {t.openDashboard}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative py-20 md:py-32">
          <div className="absolute inset-0 z-0">
             <Image 
              src="https://storage.googleapis.com/project-twix-public-images/user-669f9e5be62270eda3c683b5/1721868352528.png"
              alt="School background"
              fill
              style={{ objectFit: 'cover' }}
              className="opacity-40"
              priority
             />
             <div className="absolute inset-0 bg-background/60 backdrop-blur-sm"></div>
          </div>
          <div className="container relative z-10 max-w-7xl text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl">
              {t.heroTitle}
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-lg text-foreground/80 md:text-xl">
              {t.heroSubtitle}
            </p>
            <div className="mt-10 flex justify-center gap-4">
               <Link href="/login">
                  <Button size="lg">
                    {t.openDashboard}
                  </Button>
                </Link>
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
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {habits.map((habit) => (
                <div key={habit.name} className="flex flex-col items-center text-center p-6 rounded-lg">
                  {habit.icon}
                  <h3 className="mt-4 font-bold text-xl text-primary">{t.habits[habit.translationKey].name}</h3>
                  <p className="mt-2 text-muted-foreground">{t.habits[habit.translationKey].description}</p>
                </div>
              ))}
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
