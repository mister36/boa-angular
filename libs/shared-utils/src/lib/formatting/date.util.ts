export type DateFormatStyle = 'short' | 'medium' | 'long' | 'iso';

export function formatDate(date: string | Date, style: DateFormatStyle = 'medium'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    return '';
  }

  switch (style) {
    case 'short':
      return d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });
    case 'medium':
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    case 'long':
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    case 'iso':
      return d.toISOString().split('T')[0];
    default:
      return d.toLocaleDateString('en-US');
  }
}

export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    return '';
  }

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return years === 1 ? '1 year ago' : `${years} years ago`;
  }
}

export function parseISODate(isoString: string): Date | null {
  if (!isoString) {
    return null;
  }

  const parsed = new Date(isoString);
  if (isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

export function isValidDateRange(startDate: string, endDate: string): boolean {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return false;
  }

  return start <= end;
}
