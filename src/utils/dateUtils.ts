
import { format, parseISO } from 'date-fns';
import { fr, enUS, ar } from 'date-fns/locale';

// Function to format date based on locale
export const formatDate = (date: string | Date, formatPattern: string = 'PPP', locale: string = 'fr'): string => {
  const locales = {
    fr,
    en: enUS,
    ar
  };

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatPattern, { locale: locales[locale as keyof typeof locales] });
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(date);
  }
};

// Function to get time ago (e.g., "2 hours ago")
export const getTimeAgo = (date: string | Date): string => {
  const now = new Date();
  const pastDate = typeof date === 'string' ? new Date(date) : date;
  
  const seconds = Math.floor((now.getTime() - pastDate.getTime()) / 1000);
  
  // Time intervals in seconds
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    
    if (interval >= 1) {
      return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
    }
  }
  
  return 'just now';
};
