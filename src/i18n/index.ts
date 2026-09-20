import { translations, TranslationKey } from './translations';
import { Language } from '../types';

export function getTranslation(lang: Language, key: TranslationKey | string, fallback?: string): string {
  const dictionary = (translations as any)[lang] || translations.en;
  const text = dictionary[key] || (translations.en as any)[key] || fallback || key;
  return text;
}

export function setDocumentDirection(lang: Language): void {
  const isRtl = lang === 'ar';
  document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', lang);
  if (isRtl) {
    document.body.classList.add('rtl');
    document.body.classList.remove('ltr');
  } else {
    document.body.classList.add('ltr');
    document.body.classList.remove('rtl');
  }
}

export function formatDate(
  dateInput: string | Date | undefined,
  lang: Language = 'en',
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';

  const localeMap: Record<Language, string> = {
    en: 'en-US',
    ar: 'ar-EG',
    de: 'de-DE',
  };

  const defaultOptions: Intl.DateTimeFormatOptions = options || {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  try {
    return new Intl.DateTimeFormat(localeMap[lang] || 'en-US', defaultOptions).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}

export function formatTime(
  dateInput: string | Date | undefined,
  lang: Language = 'en',
  format24h: boolean = false,
  includeSeconds: boolean = false
): string {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';

  const localeMap: Record<Language, string> = {
    en: 'en-US',
    ar: 'ar-EG',
    de: 'de-DE',
  };

  try {
    return new Intl.DateTimeFormat(localeMap[lang] || 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: includeSeconds ? '2-digit' : undefined,
      hour12: !format24h,
    }).format(date);
  } catch {
    return date.toLocaleTimeString();
  }
}

export function formatDateTime(
  dateInput: string | Date | undefined,
  lang: Language = 'en',
  format24h: boolean = false
): string {
  if (!dateInput) return '';
  return `${formatDate(dateInput, lang)} ${formatTime(dateInput, lang, format24h)}`;
}

export function calculateAge(dateOfBirth: string): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 0 ? age : 0;
}

export function isBirthdayToday(dateOfBirth: string): boolean {
  if (!dateOfBirth) return false;
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return false;

  const today = new Date();
  return dob.getDate() === today.getDate() && dob.getMonth() === today.getMonth();
}

export function daysUntilBirthday(dateOfBirth: string): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentYear = today.getFullYear();
  let nextBday = new Date(currentYear, dob.getMonth(), dob.getDate());

  if (nextBday < today) {
    nextBday = new Date(currentYear + 1, dob.getMonth(), dob.getDate());
  }

  const diffMs = nextBday.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
