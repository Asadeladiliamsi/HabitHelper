
'use client';

import { useLanguage } from '@/contexts/language-provider';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type LanguageOption = {
  value: 'id' | 'en' | 'es' | 'fr' | 'de' | 'ja' | 'pt' | 'ru' | 'zh' | 'hi' | 'ar' | 'ko';
  flag: string;
  name: string;
};

const languages: LanguageOption[] = [
  { value: 'id', flag: '🇮🇩', name: 'Indonesia' },
  { value: 'en', flag: '🇬🇧', name: 'English' },
  { value: 'es', flag: '🇪🇸', name: 'Español' },
  { value: 'fr', flag: '🇫🇷', name: 'Français' },
  { value: 'de', flag: '🇩🇪', name: 'Deutsch' },
  { value: 'ja', flag: '🇯🇵', name: '日本語' },
  { value: 'pt', flag: '🇵🇹', name: 'Português' },
  { value: 'ru', flag: '🇷🇺', name: 'Русский' },
  { value: 'zh', flag: '🇨🇳', name: '中文' },
  { value: 'hi', flag: '🇮🇳', name: 'हिन्दी' },
  { value: 'ar', flag: '🇸🇦', name: 'العربية' },
  { value: 'ko', flag: '🇰🇷', name: '한국어' },
];

export function LanguageSettings() {
  const { language, setLanguage } = useLanguage();

  return (
    <RadioGroup
      value={language}
      onValueChange={(value) => setLanguage(value as any)}
      className="grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
    >
      {languages.map((lang) => (
        <div key={lang.value}>
          <RadioGroupItem value={lang.value} id={lang.value} className="peer sr-only" />
          <Label
            htmlFor={lang.value}
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <span className="text-2xl mb-2">{lang.flag}</span>
            {lang.name}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}
