/**
 * Data Normalization Layer
 * Handles field mapping from various API responses to standardized format
 * Prevents undefined/NaN issues before rendering
 */

export interface NormalizedExecutionRun {
  // Core identity
  id: string;
  name: string;
  
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
 * Compute duration between two date strings
 * Returns safe formatted string, never undefined/NaN
 * 
 * @param start - ISO string or timestamp
 * @param end - ISO string or timestamp
 * @returns "Xm Ys" format or "-" if invalid
 */
export function computeDuration(start?: string | null, end?: string | null): string {
  if (!start || !end) return '-';

  try {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();

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
 * Handles multiple field name variations and ensures all fields exist
 * 
 * @param run - Raw API response object
 * @returns Standardized NormalizedExecutionRun with all fields guaranteed safe
 */
export function normalizeRun(run: any): NormalizedExecutionRun {
  // Core identity - required fallbacks
  const id = run.id || 'unknown';
  const name = run.name || `Execution ${id.slice(-8).toUpperCase()}`;

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
  const browser = run.browser || run.browserName || 'Chrome';
  const environment = run.environment || run.env || 'Production';
  const tag = (Array.isArray(run.tags) && run.tags[0]) || run.tag || 'test';

  // Timestamps - CRITICAL: handle multiple field names
  // API might return: startTime, startedAt, createdAt, etc.
  const startedAt = run.startedAt || run.startTime || run.createdAt || null;
  const finishedAt = run.finishedAt || run.endTime || run.completedAt || null;

  // Screenshot URL - handle multiple field names
  const screenshotUrl = run.screenshotUrl || run.screenshot || null;

  // Test metrics
  const totalTests = run.totalTests || run.tests?.total || 0;
  const passedTests = run.passedTests || run.tests?.passed || 0;
  const failedTests = run.failedTests || run.tests?.failed || 0;

  // Compute pass rate safely
  const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  return {
    id,
    name,
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
