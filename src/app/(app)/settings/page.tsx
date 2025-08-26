
'use client';

import { ThemeSettings } from '@/components/theme-settings';
import { LanguageSettings } from '@/components/language-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/language-provider';

const translations = {
  id: {
    title: 'Pengaturan',
    description: 'Kelola pengaturan aplikasi dan preferensi Anda di sini.',
    displayTitle: 'Tampilan',
    displayDescription: 'Sesuaikan tampilan aplikasi. Aktifkan mode gelap atau terang.',
    languageTitle: 'Pilihan Bahasa',
    languageDescription: 'Pilih bahasa yang Anda inginkan untuk aplikasi.',
    notificationsTitle: 'Notifikasi',
    notificationsDescription: 'Atur preferensi notifikasi Anda. (Segera Hadir)',
    notificationsContent: 'Pengaturan notifikasi akan tersedia di sini.',
  },
  en: {
    title: 'Settings',
    description: 'Manage your application settings and preferences here.',
    displayTitle: 'Appearance',
    displayDescription: 'Customize the appearance of the app. Switch between dark and light mode.',
    languageTitle: 'Language Selection',
    languageDescription: 'Choose the language you want for the application.',
    notificationsTitle: 'Notifications',
    notificationsDescription: 'Manage your notification preferences. (Coming Soon)',
    notificationsContent: 'Notification settings will be available here.',
  }
}

export default function SettingsPage() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-muted-foreground">
          {t.description}
        </p>
      </header>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{t.displayTitle}</CardTitle>
            <CardDescription>
              {t.displayDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeSettings />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.languageTitle}</CardTitle>
            <CardDescription>
              {t.languageDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LanguageSettings />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.notificationsTitle}</CardTitle>
            <CardDescription>
              {t.notificationsDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex items-center justify-center p-8 border-2 border-dashed rounded-md bg-muted/50">
              <p className="text-sm text-muted-foreground">
                {t.notificationsContent}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
