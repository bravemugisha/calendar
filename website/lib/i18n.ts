export const languages = [
  { code: 'en', name: 'English', prefix: '/docs' },
  { code: 'zh', name: '中文', prefix: '/docs-zh' },
  { code: 'ja', name: '日本語', prefix: '/docs-ja' },
] as const;

export type LanguageCode = (typeof languages)[number]['code'];

export const defaultLanguage: LanguageCode = 'en';

export const localeItems = languages.map(language => ({
  locale: language.code,
  name: language.name,
}));

export function getLanguageFromPathname(pathname: string) {
  return (
    [...languages]
      .toSorted((a, b) => b.prefix.length - a.prefix.length)
      .find(
        language =>
          pathname === language.prefix ||
          pathname.startsWith(`${language.prefix}/`)
      ) ?? languages[0]
  );
}

export function getLanguageCodeFromPathname(pathname: string): LanguageCode {
  return getLanguageFromPathname(pathname).code;
}
