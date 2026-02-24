/**
 * Safe date formatter - handles null/undefined/invalid dates AND human-readable strings
 * CRITICAL: If backend sends "February 23, 2026 at 11:24:44 PM UTC+5:30" format,
 * return it directly WITHOUT parsing - these are already formatted
 * 
 * @param value - ISO string, timestamp, Date object, or human-readable string
 * @returns Formatted date string or "-" if invalid
 */
export function formatDate(value?: string | number | Date): string {
  if (!value) return '-';

  // STEP 2: Handle human-readable strings with "UTC" - return as-is
  if (typeof value === 'string' && value.includes('UTC')) {
    return value;
  }
  
  // STEP 2: Handle human-readable strings with "at" pattern - return as-is
  if (typeof value === 'string' && value.includes(' at ')) {
    return value;
  }

  try {
    const date = new Date(value);
    // If parsing fails, return original value (might be pre-formatted)
    if (isNaN(date.getTime())) {
      return typeof value === 'string' ? value : '-';
    }
    
    // Use en-IN locale with custom formatting for ISO strings
    const datePart = date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    
    const timePart = date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    
    return `${datePart} ${timePart}`;
  } catch {
    // Last resort: return original if string, otherwise "-"
    return typeof value === 'string' ? value : '-';
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
 * CRITICAL: If dates are human-readable strings (not ISO), cannot compute duration
 * 
 * @param start - ISO string, timestamp, or Date object
 * @param end - ISO string, timestamp, or Date object
 * @returns Formatted duration "Xm Ys" or "-" if invalid or non-computable
 */
export function formatDuration(start?: string | number | Date, end?: string | number | Date): string {
  if (!start || !end) return '-';

  // STEP 3: Cannot compute duration from human-readable strings
  if (typeof start === 'string' && (start.includes('UTC') || start.includes(' at '))) {
    return '-';
  }
  if (typeof end === 'string' && (end.includes('UTC') || end.includes(' at '))) {
    return '-';
  }

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
