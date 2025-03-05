import { ReactNode } from 'react';
import { translationKeys } from './translation-keys';

// Get all nested keys with dot notation
type JoinKeys<T, P extends string = ''> = T extends object
  ? { [K in keyof T]: JoinKeys<T[K], P extends '' ? `${K & string}` : `${P}.${K & string}`> }[keyof T]
  : P;

// Transform the type to extract string keys only
export type TranslationKey = Extract<JoinKeys<typeof translationKeys>, string>;

export type LocaleKey = 'en' | 'zh';

export interface TranslationProps {
  t: (key: TranslationKey, variables?: Record<string, string | number>) => string;
  tk: typeof translationKeys;
}

export interface LanguageInfo {
  code: LocaleKey;
  name: string;
  nativeName: string;
  icon?: ReactNode;
}

export const defaultLocale: LocaleKey = 'en';

export const locales: LanguageInfo[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
  },
];

export function isValidLocale(locale: string): locale is LocaleKey {
  return locales.some(l => l.code === locale);
}

// Helper to check if a string is a valid translation key
export function isTranslationKey(key: string): key is TranslationKey {
  function checkKey(obj: any, path: string[]): boolean {
    if (path.length === 0) return true;
    const [first, ...rest] = path;
    if (!(first in obj)) return false;
    return checkKey(obj[first], rest);
  }
  
  return checkKey(translationKeys, key.split('.'));
}
