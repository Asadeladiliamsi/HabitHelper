'use client';

import { DataInputClient } from '@/components/data-input-client';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';

export default function DataInputPage() {
  const { language } = useLanguage();
  const t = translations[language]?.dataInputPage || translations.en.dataInputPage;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-muted-foreground">
          {t.description}
        </p>
      </header>
      <DataInputClient />
    </div>
  );
}
