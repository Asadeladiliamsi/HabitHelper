'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';

export default function ReportsPage() {
  const { language } = useLanguage();
  const t = translations[language]?.reportsPage || translations.en.reportsPage;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-muted-foreground">
          {t.description}
        </p>
      </header>
      <Card className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
          <div className="rounded-full border bg-card p-4">
            <FileText className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {t.placeholderTitle}
          </CardTitle>
          <CardDescription className="max-w-xs text-muted-foreground">
            {t.placeholderDescription}
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
