/**
 * Data Normalization Layer
 * Handles field mapping from various API responses to standardized format
 * Prevents undefined/NaN issues before rendering
 */

export interface NormalizedExecutionRun {
  // Core identity
  id: string;
  runId: string;
  suiteName: string;
  
  // Status & metadata
  status: 'passed' | 'failed' | 'running' | 'pending';
  browser: string;
  environment: string;
  tag: string;
  
  // Timestamps (RAW - for computation)
  startedAt: string | null;
  finishedAt: string | null;
  
  // Screenshot URL
  screenshotUrl: string | null;
  
  // Computed metrics (for display)
  passRate: number;
  tests: { total: number; passed: number; failed: number };
}

/**
 * STEP 3 - Compute duration between two Firestore Timestamps or Dates
 * Properly converts Timestamps using convertTimestamp before computing
 * 
 * @param start - Firebase Timestamp, Date, ISO string, or null
 * @param end - Firebase Timestamp, Date, ISO string, or null
 * @returns "Xm Ys" format or "-" if invalid
 */
export function computeDuration(start?: any, end?: any): string {
  // Import at top: import { convertTimestamp } from './dateUtils';
  // For now, handle Timestamp objects inline
  
  if (!start || !end) return '-';

  try {
    let startTime: number;
    let endTime: number;

    // Handle Firebase Timestamp objects
    if (typeof start === 'object' && typeof start.toDate === 'function') {
      startTime = start.toDate().getTime();
    } else if (start instanceof Date) {
      startTime = start.getTime();
    } else {
      startTime = new Date(start).getTime();
    }

    if (typeof end === 'object' && typeof end.toDate === 'function') {
      endTime = end.toDate().getTime();
    } else if (end instanceof Date) {
      endTime = end.getTime();
    } else {
      endTime = new Date(end).getTime();
    }

    // Validate: both must be valid timestamps
    if (isNaN(startTime) || isNaN(endTime)) return '-';
    
    // Validate: end must be after start
    if (endTime <= startTime) return '-';

    const diffMs = endTime - startTime;
    const totalSeconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  } catch {
    return '-';
  }
}

/**
 * Normalize execution run from API response
 * STEP 4: DO NOT CONVERT Firestore Timestamps - Keep original objects
 * Conversion happens in formatDate/computeDuration using convertTimestamp
 * 
 * Backend returns: startedAt, finishedAt as Firestore Timestamp objects
 * Keep them as-is for proper handling downstream
 * 
 * @param run - Raw API response object with Firestore Timestamps
 * @returns Standardized NormalizedExecutionRun with Timestamps preserved
 */
export function normalizeRun(run: any): NormalizedExecutionRun {
  // Core identity - required fallbacks
  const id = run.id || 'unknown';
  const runId = run.runId || run.publicId || id;
  const suiteName = run.suiteName || run.name || 'Execution Suite';

  // Status determination - COMPLETE MAP of all backend values
  let status: 'passed' | 'failed' | 'running' | 'pending' = 'pending';
  if (run.status) {
    const statusMap: Record<string, 'passed' | 'failed' | 'running' | 'pending'> = {
      // Lowercase variants
      'pass': 'passed',
      'passed': 'passed',
      'fail': 'failed',
      'failed': 'failed',
      'running': 'running',
      'pending': 'pending',
      // Uppercase variants (backend uses these)
      'PASS': 'passed',
      'PASSED': 'passed',
      'FAIL': 'failed',
      'FAILED': 'failed',
      'RUNNING': 'running',
      'PENDING': 'pending',
      // Alternative backend values
      'SUCCESS': 'passed',
      'COMPLETED': 'passed',
      'COMPLETE': 'passed',
      'ERROR': 'failed',
    };
    status = statusMap[run.status] || 'pending';
  }

  // Metadata with safe defaults
  const browser = run.browser ?? 'Chrome';
  const environment = run.environment ?? 'Production';
  const tag = (Array.isArray(run.tags) && run.tags[0]) ?? 'test';

  // STEP 4: Keep Firestore Timestamp objects as-is
  // Do NOT convert here - conversion happens in formatDate/computeDuration
  // This preserves the Timestamp.toDate() method
  const startedAt = run.startedAt ?? null;
  const finishedAt = run.finishedAt ?? null;

  // Screenshot URL
  const screenshotUrl = run.screenshotUrl ?? run.screenshot ?? null;

  // Test metrics
  const totalTests = run.totalTests ?? run.tests?.total ?? 0;
  const passedTests = run.passedTests ?? run.tests?.passed ?? 0;
  const failedTests = run.failedTests ?? run.tests?.failed ?? 0;

  // Compute pass rate safely
  const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  return {
    id,
    runId,
    suiteName,
    status,
    browser,
    environment,
    tag,
    startedAt,
    finishedAt,
    screenshotUrl,
    passRate,
    tests: { total: totalTests, passed: passedTests, failed: failedTests },
  };
}

/**
 * Batch normalize multiple runs
 * @param runs - Array of raw API response objects
 * @returns Array of NormalizedExecutionRun
 */
export function normalizeRunList(runs: any[]): NormalizedExecutionRun[] {
  if (!Array.isArray(runs)) return [];
  return runs.map(normalizeRun);
}
