
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to generate a random code of specified length
export function generateRandomCode(length: number = 6): string {
  const digits = '0123456789';
  let code = '';

  for (let i = 0; i < length; i++) {
    code += digits[Math.floor(Math.random() * 10)];
  }

  return code;
}

// Function to format a date string
export function formatDate(dateString: string, options: Intl.DateTimeFormatOptions = {}): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options
  }).format(date);
}

// Function to capitalize the first letter of each word
export function capitalizeWords(str: string): string {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Function to truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Function to calculate time ago from a date
export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000; // years

  if (interval > 1) {
    return Math.floor(interval) + ' an' + (Math.floor(interval) > 1 ? 's' : '');
  }

  interval = seconds / 2592000; // months
  if (interval > 1) {
    return Math.floor(interval) + ' mois';
  }

  interval = seconds / 86400; // days
  if (interval > 1) {
    return Math.floor(interval) + ' jour' + (Math.floor(interval) > 1 ? 's' : '');
  }

  interval = seconds / 3600; // hours
  if (interval > 1) {
    return Math.floor(interval) + ' heure' + (Math.floor(interval) > 1 ? 's' : '');
  }

  interval = seconds / 60; // minutes
  if (interval > 1) {
    return Math.floor(interval) + ' minute' + (Math.floor(interval) > 1 ? 's' : '');
  }

  return Math.floor(seconds) + ' seconde' + (Math.floor(seconds) > 1 ? 's' : '');
}

// Format a date relative to now (e.g., "2 days ago", "in 3 hours")
export function formatRelativeDate(dateString: string): string {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    const now = new Date();

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Date invalide';
    }

    // For future dates
    if (date > now) {
      const seconds = Math.floor((date.getTime() - now.getTime()) / 1000);

      let interval = seconds / 31536000; // years
      if (interval > 1) {
        return 'Dans ' + Math.floor(interval) + ' an' + (Math.floor(interval) > 1 ? 's' : '');
      }

      interval = seconds / 2592000; // months
      if (interval > 1) {
        return 'Dans ' + Math.floor(interval) + ' mois';
      }

      interval = seconds / 86400; // days
      if (interval > 1) {
        return 'Dans ' + Math.floor(interval) + ' jour' + (Math.floor(interval) > 1 ? 's' : '');
      }

      interval = seconds / 3600; // hours
      if (interval > 1) {
        return 'Dans ' + Math.floor(interval) + ' heure' + (Math.floor(interval) > 1 ? 's' : '');
      }

      interval = seconds / 60; // minutes
      if (interval > 1) {
        return 'Dans ' + Math.floor(interval) + ' minute' + (Math.floor(interval) > 1 ? 's' : '');
      }

      return 'Dans ' + Math.floor(seconds) + ' seconde' + (Math.floor(seconds) > 1 ? 's' : '');
    }

    // For past dates, use the existing timeAgo function
    return timeAgo(dateString);
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return 'Date invalide';
  }
}
