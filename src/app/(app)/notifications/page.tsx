'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NotificationsClient } from '@/components/notifications-client';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';
import { StudentProvider } from '@/contexts/student-context';

export default function NotificationsPage() {
  const { language } = useLanguage();
  const t = translations[language]?.notificationsPage || translations.en.notificationsPage;

  return (
    <StudentProvider>
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground">
            {t.description}
          </p>
        </header>

        <Card className="mx-auto w-full max-w-2xl">
          <CardHeader>
            <CardTitle>{t.cardTitle}</CardTitle>
            <CardDescription>
              {t.cardDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NotificationsClient />
          </CardContent>
        </Card>
      </div>
    </StudentProvider>
  );
}