'use client';

import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';
import { ReportsClient } from '@/components/reports-client';

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
      <ReportsClient />
    </div>
  );
}
