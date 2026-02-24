/**
 * STEP 1 - Convert Firebase Timestamp objects to JavaScript Date
 * Firebase Admin SDK returns Timestamp { seconds, nanoseconds }
 * which has a toDate() method
 * 
 * Also handles ISO strings, Date objects, and timestamps
 * 
 * @param value - Firebase Timestamp, Date, ISO string, or timestamp
 * @returns JavaScript Date object or null if invalid
 */
export function convertTimestamp(value?: any): Date | null {
  if (!value) return null;

  // STEP 1: Handle Firebase Timestamp objects with toDate() method
  if (typeof value === 'object' && typeof value.toDate === 'function') {
    try {
      return value.toDate();
    } catch (e) {
      console.error('Error converting Firebase Timestamp:', e);
      return null;
    }
  }

  // Handle JavaScript Date objects
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  // Handle ISO strings and timestamps
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  return null;
}

/**
 * STEP 2 - Safe date formatter using converted Timestamp
 * Handles Firebase Timestamp objects, Date objects, ISO strings
 * 
 * @param value - Firebase Timestamp, Date, or ISO string
 * @returns Formatted date string in Indian locale with 12-hour time or "-" if invalid
 */
export function formatDate(value?: any): string {
  const date = convertTimestamp(value);
  if (!date) return '-';

  try {
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
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
 * @param value - Firebase Timestamp, Date, ISO string, or timestamp
 * @returns Formatted time string or "-" if invalid
 */
export function formatTime(value?: any): string {
  const date = convertTimestamp(value);
  if (!date) return '-';

  try {
    return date.toLocaleTimeString('en-IN', {
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
 * STEP 3 - Format duration between two Firestore Timestamps or Dates
 * Properly converts Timestamps using toDate() before computing duration
 * 
 * @param start - Firebase Timestamp, Date, ISO string, or timestamp
 * @param end - Firebase Timestamp, Date, ISO string, or timestamp
 * @returns Formatted duration "Xm Ys" or "-" if invalid
 */
export function formatDuration(start?: any, end?: any): string {
  const startDate = convertTimestamp(start);
  const endDate = convertTimestamp(end);

  if (!startDate || !endDate) return '-';

  try {
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
