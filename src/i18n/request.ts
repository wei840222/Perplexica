import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { LOCALES, type AppLocale } from './locales';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('locale')?.value as
    | AppLocale
    | undefined;
  const locale: AppLocale = (LOCALES as readonly string[]).includes(
    cookieLocale as string,
  )
    ? (cookieLocale as AppLocale)
    : 'en';

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
