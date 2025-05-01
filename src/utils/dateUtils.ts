
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Format a date relative to now (e.g., "2 hours ago", "3 days ago")
 */
export const timeAgo = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: fr });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date inconnue';
  }
};

/**
 * Format a date using the specified format
 */
export const formatDate = (date: string | Date, formatString: string = 'dd/MM/yyyy'): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, formatString, { locale: fr });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date invalide';
  }
};

/**
 * Get a date that's X days in the future from now
 */
export const getFutureDate = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};
