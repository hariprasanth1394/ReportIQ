/**
 * Format milliseconds to human-readable duration
 * @param ms - Duration in milliseconds
 * @returns Formatted string (e.g., "2m 34s", "45s", or "-" if invalid)
 */
export function formatDuration(ms: number | null | undefined): string {
  if (ms === null || ms === undefined || isNaN(ms)) {
    return '-';
  }

  const seconds = Math.floor(Math.abs(ms) / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}

/**
 * Format ISO date string to readable format
 * @param dateString - ISO date string or Date object
 * @param format - 'full' for full datetime, 'time' for time only, 'date' for date only
 * @returns Formatted date string or "-" if invalid
 */
export function formatDate(
  dateString: string | Date | null | undefined,
  format: 'full' | 'time' | 'date' = 'full'
): string {
  if (!dateString) return '-';

  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

    if (isNaN(date.getTime())) {
      return '-';
    }

    switch (format) {
      case 'time':
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });
      case 'date':
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      case 'full':
      default:
        return date.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
    }
  } catch {
    return '-';
  }
}

/**
 * Calculate duration between two dates in milliseconds
 * @param startTime - Start date/time
 * @param endTime - End date/time
 * @returns Duration in milliseconds, or null if invalid
 */
export function calculateDurationMs(
  startTime: string | Date | null | undefined,
  endTime: string | Date | null | undefined
): number | null {
  if (!startTime || !endTime) return null;

  try {
    const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
    const end = typeof endTime === 'string' ? new Date(endTime) : endTime;

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return null;
    }

    return end.getTime() - start.getTime();
  } catch {
    return null;
  }
}
