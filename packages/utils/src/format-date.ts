import { format, isValid, parseISO } from 'date-fns';

export const DEFAULT_DATE_FALLBACK = '—';

const toDate = (value: string | Date | null | undefined): Date | null => {
  if (!value) {
    return null;
  }
  const date = typeof value === 'string' ? parseISO(value) : value;
  return isValid(date) ? date : null;
};

export const formatDate = (
  value: string | Date | null | undefined,
  pattern: string,
  fallback = DEFAULT_DATE_FALLBACK,
): string => {
  const date = toDate(value);
  return date ? format(date, pattern) : fallback;
};

export const formatShortDate = (
  value: string | Date | null | undefined,
  fallback = DEFAULT_DATE_FALLBACK,
): string => formatDate(value, 'MMM d', fallback);

export const formatDateTime = (
  value: string | Date | null | undefined,
  fallback = DEFAULT_DATE_FALLBACK,
): string => formatDate(value, 'MMM d, yyyy, h:mm a', fallback);