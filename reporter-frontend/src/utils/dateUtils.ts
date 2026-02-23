/**
 * Safe date formatter - handles null/undefined/invalid dates
 * @param value - ISO string, timestamp, or Date object
 * @returns Formatted date string or "-" if invalid
 */
export function formatDate(value?: string | number | Date): string {
  if (!value) return '-';

  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return '-';
    
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '-';
  }
}

/**
 * Safe date formatter for time only
 * @param value - ISO string, timestamp, or Date object
 * @returns Formatted time string or "-" if invalid
 */
export function formatTime(value?: string | number | Date): string {
  if (!value) return '-';

  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return '-';
    
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch {
    return '-';
  }
}

/**
 * Format duration between two dates
 * @param start - ISO string, timestamp, or Date object
 * @param end - ISO string, timestamp, or Date object
 * @returns Formatted duration "Xm Ys" or "-" if invalid
 */
export function formatDuration(start?: string | number | Date, end?: string | number | Date): string {
  if (!start || !end) return '-';

  try {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return '-';

    const diff = endDate.getTime() - startDate.getTime();
    if (diff <= 0) return '-';

    const totalSeconds = Math.floor(diff / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  } catch {
    return '-';
  }
}

/**
 * Format duration from milliseconds
 * @param ms - Duration in milliseconds
 * @returns Formatted duration "Xm Ys" or "-" if invalid
 */
export function formatDurationMs(ms?: number): string {
  if (ms === null || ms === undefined || isNaN(ms) || ms < 0) return '-';

  try {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  } catch {
    return '-';
  }
}

/**
 * Format relative timestamp (e.g., "2h ago", "just now")
 * @param value - ISO string, timestamp, or Date object
 * @returns Relative time string or "-" if invalid
 */
export function formatRelativeTime(value?: string | number | Date): string {
  if (!value) return '-';

  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return '-';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return formatDate(value);
  } catch {
    return '-';
  }
}
