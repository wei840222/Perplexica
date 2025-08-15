'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

const LOCALES = ['en', 'zh-TW'] as const;

export type AppLocale = (typeof LOCALES)[number];

function setLocaleCookie(value: AppLocale) {
  const oneYear = 60 * 60 * 24 * 365;
  const isSecure =
    typeof window !== 'undefined' && window.location.protocol === 'https:';
  document.cookie = `locale=${value}; path=/; max-age=${oneYear}; samesite=lax${isSecure ? '; secure' : ''}`;
}

export default function LocaleSwitcher({
  onChange,
}: {
  onChange?: (next: AppLocale) => void;
}) {
  const router = useRouter();
  const current = useLocale();
  const currentLocale: AppLocale = useMemo(() => {
    return (LOCALES as readonly string[]).includes(current)
      ? (current as AppLocale)
      : 'en';
  }, [current]);

  const [value, setValue] = useState<AppLocale>(currentLocale);

  useEffect(() => {
    setValue(currentLocale);
  }, [currentLocale]);

  return (
    <select
      value={value}
      onChange={(e) => {
        const next = e.target.value as AppLocale;
        setValue(next);
        setLocaleCookie(next);
        onChange?.(next);
        router.refresh();
      }}
      className={
        'bg-light-secondary dark:bg-dark-secondary px-3 py-2 flex items-center overflow-hidden border border-light-200 dark:border-dark-200 dark:text-white rounded-lg text-sm'
      }
      aria-label="Language"
    >
      <option value="en">English</option>
      <option value="zh-TW">繁體中文</option>
    </select>
  );
}
