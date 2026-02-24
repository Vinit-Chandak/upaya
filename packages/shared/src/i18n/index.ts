import { hi } from './hi';
import type { TranslationKeys } from './hi';
import { en } from './en';
import type { Language } from '../types/user';

export type { TranslationKeys };
export { hi, en };

const translations: Record<Language, TranslationKeys> = { hi, en };

/**
 * Get the translation object for a given language.
 */
export function getTranslations(language: Language): TranslationKeys {
  return translations[language];
}

/**
 * Simple template interpolation for translation strings.
 * Replaces {{key}} placeholders with provided values.
 *
 * @example
 * interpolate('Hello, {{name}}!', { name: 'Mohit' })
 * // => 'Hello, Mohit!'
 */
export function interpolate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    return key in values ? String(values[key]) : `{{${key}}}`;
  });
}
