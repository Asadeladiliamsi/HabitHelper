
'use client';

import { useLanguage } from '@/contexts/language-provider';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function LanguageSettings() {
  const { language, setLanguage } = useLanguage();

  return (
    <RadioGroup
      value={language}
      onValueChange={(value) => setLanguage(value as 'id' | 'en')}
      className="grid max-w-md grid-cols-1 gap-4 sm:grid-cols-2"
    >
      <div>
        <RadioGroupItem value="id" id="id" className="peer sr-only" />
        <Label
          htmlFor="id"
          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
        >
          <span className="text-2xl mb-2">🇮🇩</span>
          Indonesia
        </Label>
      </div>
      <div>
        <RadioGroupItem value="en" id="en" className="peer sr-only" />
        <Label
          htmlFor="en"
          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
        >
          <span className="text-2xl mb-2">🇬🇧</span>
          English
        </Label>
      </div>
    </RadioGroup>
  );
}
