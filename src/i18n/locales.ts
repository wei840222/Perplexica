export const LOCALES = ['en', 'zh-TW'] as const;
export type AppLocale = (typeof LOCALES)[number];

// UI labels for language options
export const LOCALE_LABELS: Record<AppLocale, string> = {
  en: 'English',
  'zh-TW': '繁體中文',
};

// Human-readable language name for prompt prefix
export function getPromptLanguageName(loc: string): string {
  const l = (loc || '').toLowerCase();
  const match = (
    Object.keys(LOCALE_LABELS) as Array<keyof typeof LOCALE_LABELS>
  ).find((k) => k.toLowerCase() === l);
  if (match) return LOCALE_LABELS[match];
  return LOCALE_LABELS['en'];
}
