import { translationKeys } from '../types/translation-keys';
import { LocaleKey, isValidLocale } from '../types/translations';
import en from '../locales/en.json';
import zh from '../locales/zh.json';

type TranslationData = typeof en;

const translations: Record<LocaleKey, TranslationData> = {
  en,
  zh,
};

function flattenTranslationObject(obj: any, prefix = ''): Record<string, string> {
  return Object.keys(obj).reduce((acc: Record<string, string>, key: string) => {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'string') {
      acc[newKey] = value;
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(acc, flattenTranslationObject(value, newKey));
    }
    
    return acc;
  }, {});
}

let flattenedTranslations: Record<LocaleKey, Record<string, string>> = {
  en: flattenTranslationObject(en),
  zh: flattenTranslationObject(zh),
};

export async function loadTranslations(locale: string): Promise<Record<string, string>> {
  if (!isValidLocale(locale)) {
    console.warn(`Invalid locale "${locale}", falling back to "en"`);
    return flattenedTranslations.en;
  }

  try {
    return flattenedTranslations[locale];
  } catch (error) {
    console.error(`Failed to load translations for "${locale}"`, error);
    return flattenedTranslations.en;
  }
}

// Re-export translation keys for convenience
export const tk = translationKeys;

// Get nested translation key value
export function getTranslationValue(obj: TranslationData, path: string): string | undefined {
  if (!path) return undefined;
  const keys = path.split('.');
  let value: any = obj;
  for (const key of keys) {
    if (value === undefined || value === null) return undefined;
    value = value[key];
  }
  return typeof value === 'string' ? value : undefined;
}

function getAllTranslationKeys(obj: unknown, prefix = ''): string[] {
  if (typeof obj !== 'object' || obj === null) {
    return [];
  }

  return Object.entries(obj as Record<string, unknown>).flatMap(([key, value]) => {
    const currentKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      return [currentKey];
    }
    if (typeof value === 'object' && value !== null) {
      return getAllTranslationKeys(value, currentKey);
    }
    return [];
  });
}

// Helper to convert translation keys to flattened paths
function getDefinedKeyPaths(): string[] {
  function traverse(obj: unknown, prefix = ''): string[] {
    if (typeof obj !== 'object' || obj === null) {
      return [];
    }

    return Object.entries(obj as Record<string, unknown>).flatMap(([key, value]) => {
      const currentKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'string') {
        return [value];
      }
      return traverse(value, currentKey);
    });
  }

  return traverse(translationKeys);
}

// Validate translation files against translation keys
export function validateTranslations() {
  if (import.meta.env.DEV) {
    const enKeys = getAllTranslationKeys(en);
    const zhKeys = getAllTranslationKeys(zh);
    const allKeys = new Set([...enKeys, ...zhKeys]);
    const definedKeys = new Set(getDefinedKeyPaths());

    const missingKeys: Record<LocaleKey, string[]> = {
      en: [],
      zh: [],
    };

    allKeys.forEach(key => {
      if (!getTranslationValue(en, key)) missingKeys.en.push(key);
      if (!getTranslationValue(zh, key)) missingKeys.zh.push(key);
    });

    if (missingKeys.en.length > 0) {
      console.warn('Missing English translations:', missingKeys.en);
    }
    if (missingKeys.zh.length > 0) {
      console.warn('Missing Chinese translations:', missingKeys.zh);
    }

    // Check for unused keys
    const unusedKeys = Array.from(allKeys).filter(key => !definedKeys.has(key));
    if (unusedKeys.length > 0) {
      console.warn('Unused translation keys:', unusedKeys);
    }
  }
}

// Run validation in development
validateTranslations();
