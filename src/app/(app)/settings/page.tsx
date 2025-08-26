
'use client';

import { ThemeSettings } from '@/components/theme-settings';
import { LanguageSettings } from '@/components/language-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';

export default function SettingsPage() {
  const { language } = useLanguage();
  const t = translations[language]?.settingsPage || translations.en.settingsPage;

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
