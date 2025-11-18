'use client';

import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { Languages, Check } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
];

export function LanguageSwitcher() {
  const [currentLocale, setCurrentLocale] = useState('en'); // Default to English
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (locale: string) => {
    setCurrentLocale(locale);

    startTransition(() => {
      // Get the current pathname without locale
      const pathWithoutLocale = pathname.replace(/^\/(en|id)/, '');

      // Navigate to the new locale
      router.push(`/${locale}${pathWithoutLocale || '/'}`);
    });
  };

  const currentLanguage = languages.find((lang) => lang.code === currentLocale) || languages[0];

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          variant="flat"
          size="sm"
          startContent={<Languages className="h-4 w-4" />}
          isLoading={isPending}
        >
          {currentLanguage.flag} {currentLanguage.name}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Language selection"
        selectionMode="single"
        selectedKeys={[currentLocale]}
      >
        {languages.map((lang) => (
          <DropdownItem
            key={lang.code}
            onClick={() => switchLanguage(lang.code)}
            startContent={lang.flag}
            endContent={lang.code === currentLocale ? <Check className="h-4 w-4" /> : null}
          >
            {lang.name}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
