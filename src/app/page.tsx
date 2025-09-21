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
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';

// Menggunakan Lucide React sebagai pengganti Material Icons untuk konsistensi
const metrics = [
  {
    icon: <CheckCircle className="h-12 w-12 text-primary" />,
    title: 'Habit Completion Rate',
    description: 'Track the percentage of daily habits successfully completed by students.',
  },
  {
    icon: <TrendingUp className="h-12 w-12 text-primary" />,
    title: 'Progress Trends',
    description: 'Visualize improvement over time with clear, actionable trend data.',
  },
  {
    icon: <AlertTriangle className="h-12 w-12 text-primary" />,
    title: 'Areas for Improvement',
    description: 'Identify specific habits or areas where students may need extra support.',
  },
  {
    icon: <Award className="h-12 w-12 text-primary" />,
    title: 'Milestone Achievements',
    description: 'Recognize and celebrate student achievements and progress milestones.',
  },
  {
    icon: <Users className="h-12 w-12 text-primary" />,
    title: 'Classroom Averages',
    description: 'Compare class performance and identify effective strategies.',
  },
  {
    icon: <FileText className="h-12 w-12 text-primary" />,
    title: 'Customizable Reports',
    description: 'Generate tailored reports based on specific needs and parameters.',
  },
];

const features = [
  {
    icon: <LayoutDashboard className="h-10 w-10 text-primary flex-shrink-0" />,
    title: 'Comprehensive Dashboard',
    description: 'A central hub for all student progress, habit tracking, and performance analytics.',
  },
  {
    icon: <BarChart2 className="h-10 w-10 text-primary flex-shrink-0" />,
    title: 'Detailed Analytics',
    description: 'Dive deep into data with interactive charts and visual representations of student behavior.',
  },
  {
    icon: <Bell className="h-10 w-10 text-primary flex-shrink-0" />,
    title: 'Smart Notifications',
    description: 'Receive alerts for significant changes or areas needing attention.',
  },
  {
    icon: <DownloadCloud className="h-10 w-10 text-primary flex-shrink-0" />,
    title: 'Exportable Reports',
    description: 'Easily download and share progress reports for meetings or personal records.',
  },
];


export default function LandingPage() {
  // const { language } = useLanguage();
  // const t = translations[language]?.landingPage || translations.en.landingPage;

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
            <Link href="/reports" className="text-primary font-medium hover:underline hidden sm:block">
              Reports
            </Link>
            <Link href="/data-master" className="text-primary font-medium hover:underline hidden sm:block">
              Features
            </Link>
            <Link href="/login">
                <Button className="bg-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300">
                Buka Dashboard
                </Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        <section className="text-center py-20 lg:py-32 px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-primary">
            Monitor Student Progress Seamlessly
          </h1>
          <p className="max-w-3xl mx-auto text-lg text-muted-foreground mb-10">
            Kalih.Spensa id provides educators and parents with powerful tools to track character development, identify trends, and foster a supportive learning environment. Gain valuable insights into student habits and progress.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/reports">
                <Button size="lg" className="bg-primary hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 duration-300 w-full sm:w-auto">
                    View Student Reports
                </Button>
            </Link>
            <Link href="#features">
                <Button size="lg" variant="outline" className="bg-card hover:bg-muted text-foreground font-bold py-3 px-6 rounded-lg shadow-lg transition-colors duration-300 w-full sm:w-auto">
                    Explore Features
                </Button>
            </Link>
          </div>
        </section>

        <section className="py-20 lg:py-24 bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4 text-primary">
                Key Reporting Metrics
              </h2>
              <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
                Understand the core habits we track to build a holistic view of student character development.
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
                Features for Educators & Parents
              </h2>
              <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
                Our platform is built to streamline the monitoring process and enhance communication between home and school.
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
              Ready to Enhance Student Development?
            </h2>
            <p className="text-lg mb-10 opacity-90">
              Join educators and parents who are leveraging Kalih.Spensa id to build a stronger foundation for student success.
            </p>
            <Link href="/login">
                <Button
                    variant="secondary"
                    size="lg"
                    className="bg-white hover:bg-gray-100 text-primary font-bold py-3 px-8 rounded-full shadow-xl transition-colors duration-300"
                    >
                    Get Started with Your Dashboard
                </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-card py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} Kalih.Spensa id | Empowering Character Development. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
