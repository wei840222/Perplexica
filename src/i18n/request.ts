import { cookies, headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { LOCALES, type AppLocale } from './locales';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('locale')?.value as
    | AppLocale
    | undefined;

  // Helper: parse Accept-Language and pick best supported locale
  function resolveFromAcceptLanguage(al: string | null | undefined): AppLocale {
    const supported = new Set<string>(LOCALES as readonly string[]);
    const raw = (al || '').toLowerCase();
    if (!raw) return 'en';

    type Candidate = { tag: string; q: number };
    const candidates: Candidate[] = raw
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [tagPart, ...params] = part.split(';');
        const tag = tagPart.trim();
        let q = 1;
        for (const p of params) {
          const m = p.trim().match(/^q=([0-9.]+)$/);
          if (m) {
            const v = parseFloat(m[1]);
            if (!Number.isNaN(v)) q = v;
          }
        }
        return { tag, q } as Candidate;
      })
      .sort((a, b) => b.q - a.q);

    // Try in order: exact match -> base language match -> custom mapping
    for (const { tag } of candidates) {
      // exact match against supported
      const exact = Array.from(supported).find((s) => s.toLowerCase() === tag);
      if (exact) return exact as AppLocale;

      // base language match (e.g., en-US -> en)
      const base = tag.split('-')[0];
      const baseMatch = Array.from(supported).find(
        (s) => s.split('-')[0].toLowerCase() === base,
      );
      if (baseMatch) return baseMatch as AppLocale;

      // custom mapping for common Chinese variants to zh-TW since it's our only zh locale
      if (tag.startsWith('zh')) return 'zh-TW';
    }
    return 'en';
  }

  const hasCookie = (LOCALES as readonly string[]).includes(
    (cookieLocale as string) ?? '',
  );
  let locale: AppLocale;
  if (hasCookie) {
    locale = cookieLocale as AppLocale;
  } else {
    const hdrs = await headers();
    const acceptLanguage = hdrs.get('accept-language');
    locale = resolveFromAcceptLanguage(acceptLanguage);
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
