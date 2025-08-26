
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
  },
  es: {
    title: 'Configuración',
    description: 'Administre la configuración y las preferencias de su aplicación aquí.',
    displayTitle: 'Apariencia',
    displayDescription: 'Personaliza la apariencia de la aplicación. Cambia entre el modo oscuro y claro.',
    languageTitle: 'Selección de idioma',
    languageDescription: 'Elige el idioma que deseas para la aplicación.',
    notificationsTitle: 'Notificaciones',
    notificationsDescription: 'Administre sus preferencias de notificación. (Próximamente)',
    notificationsContent: 'La configuración de notificaciones estará disponible aquí.',
  },
  fr: {
    title: 'Paramètres',
    description: 'Gérez les paramètres et les préférences de votre application ici.',
    displayTitle: 'Apparence',
    displayDescription: 'Personnalisez l\'apparence de l\'application. Basculez entre le mode sombre et le mode clair.',
    languageTitle: 'Sélection de la langue',
    languageDescription: 'Choisissez la langue que vous souhaitez pour l\'application.',
    notificationsTitle: 'Notifications',
    notificationsDescription: 'Gérez vos préférences de notification. (Bientôt disponible)',
    notificationsContent: 'Les paramètres de notification seront disponibles ici.',
  },
  de: {
    title: 'Einstellungen',
    description: 'Verwalten Sie hier Ihre Anwendungseinstellungen und Präferenzen.',
    displayTitle: 'Erscheinungsbild',
    displayDescription: 'Passen Sie das Erscheinungsbild der App an. Wechseln Sie zwischen dunklem und hellem Modus.',
    languageTitle: 'Sprachauswahl',
    languageDescription: 'Wählen Sie die gewünschte Sprache für die Anwendung.',
    notificationsTitle: 'Benachrichtigungen',
    notificationsDescription: 'Verwalten Sie Ihre Benachrichtigungseinstellungen. (Demnächst verfügbar)',
    notificationsContent: 'Benachrichtigungseinstellungen werden hier verfügbar sein.',
  },
  ja: {
    title: '設定',
    description: 'ここでアプリケーションの設定と個人設定を管理します。',
    displayTitle: '外観',
    displayDescription: 'アプリの外観をカスタマイズします。ダークモードとライトモードを切り替えます。',
    languageTitle: '言語選択',
    languageDescription: 'アプリケーションに使用する言語を選択してください。',
    notificationsTitle: '通知',
    notificationsDescription: '通知設定を管理します。（近日公開）',
    notificationsContent: '通知設定はここに表示されます。',
  }
}

export default function SettingsPage() {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

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
