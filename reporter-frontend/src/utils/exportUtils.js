import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf/dist/jspdf.umd.min.js';
import 'jspdf/dist/jspdf.umd.min.js';

/**
 * Export dashboard data to Excel with summary and detailed sheets
 */
export const exportDashboardToExcel = (runs, stats, fileName = 'test-execution-report.xlsx') => {
  try {
    const data = runs.map(run => ({
      Browser: run.browser,
      Tags: run.tags?.join(', ') || '-',
      Status: run.status,
      'Test Cases': run.totalTests || run.testCaseCount || 0,
      Passed: run.passedTests || run.passCount || 0,
      Failed: run.failedTests || run.failCount || 0,
      Started: run.startedAt ? new Date(run.startedAt).toLocaleString() : '-',
      Finished: run.finishedAt ? new Date(run.finishedAt).toLocaleString() : '-'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Test Runs');
    
    // Add summary sheet
    const summary = [
      ['Test Execution Summary'],
      [],
      ['Total Runs', stats.total],
      ['Passed', stats.passed],
      ['Failed', stats.failed],
      ['Running', stats.running],
      [],
      ['Total Tests', stats.totalTests],
      ['Passed Tests', stats.passedTests],
      ['Failed Tests', stats.failedTests],
      ['Pass Rate %', stats.passRate]
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summary);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
    
    XLSX.writeFile(wb, fileName);
    return { success: true };
  } catch (error) {
    console.error('Excel export error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Export execution run details to Excel
 */
export const exportExecutionToExcel = (run, fileName = 'execution-details.xlsx') => {
  try {
    const testCases = run.testCases || [];
    const data = testCases.map(tc => ({
      'Test Case': tc.name,
      'Status': tc.status,
      'Steps': tc.steps?.length || 0,
      'Duration': ((new Date(tc.finishedAt || Date.now()).getTime() - new Date(tc.startedAt).getTime()) / 1000).toFixed(2) + 's',
      'Started': new Date(tc.startedAt).toLocaleTimeString(),
      'Finished': tc.finishedAt ? new Date(tc.finishedAt).toLocaleTimeString() : '-'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Test Cases');

    // Summary sheet
    const summary = [
      ['Test Execution Details'],
      [],
      ['Browser', run.browser],
      ['Status', run.status],
      ['Started', new Date(run.startedAt).toLocaleString()],
      ['Finished', run.finishedAt ? new Date(run.finishedAt).toLocaleString() : 'Running'],
      [],
      ['Total Test Cases', testCases.length],
      ['Passed', testCases.filter(tc => tc.status === 'PASS').length],
      ['Failed', testCases.filter(tc => tc.status === 'FAIL').length],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summary);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    XLSX.writeFile(wb, fileName);
    return { success: true };
  } catch (error) {
    console.error('Excel export error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Export execution run to PDF with metrics and test case details
 */
export const exportExecutionToPDF = (run, metrics, fileName = 'execution-report.pdf') => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;

    // Header
    doc.setFontSize(18);
    doc.setTextColor(59, 130, 246); // Blue
    doc.text(`Test Execution Report`, margin, yPosition);
    yPosition += 10;

    // Run details
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const runInfo = [
      `Browser: ${run.browser}`,
      `Status: ${run.status}`,
      `Started: ${new Date(run.startedAt).toLocaleString()}`,
      `Finished: ${run.finishedAt ? new Date(run.finishedAt).toLocaleString() : 'Running'}`,
      `Tags: ${run.tags?.join(', ') || 'N/A'}`
    ];
    
    runInfo.forEach(info => {
      doc.text(info, margin, yPosition);
      yPosition += 6;
    });
    yPosition += 5;

    // Summary metrics
    doc.setFontSize(12);
    doc.setTextColor(59, 130, 246);
    doc.text('Summary Metrics', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const metricsInfo = [
      `Total Test Cases: ${metrics.total}`,
      `Passed: ${metrics.passed} (${metrics.passRate}%)`,
      `Failed: ${metrics.failed}`,
      `Average Duration: ${metrics.avgDuration}s`,
      `Maximum Duration: ${metrics.maxDuration}s`,
      `Total Steps: ${metrics.totalSteps}`
    ];
    
    metricsInfo.forEach(info => {
      doc.text(info, margin, yPosition);
      yPosition += 6;
    });
    yPosition += 8;

    // Test cases table
    doc.setFontSize(12);
    doc.setTextColor(59, 130, 246);
    doc.text('Test Cases', margin, yPosition);
    yPosition += 8;

    const testCases = run.testCases || [];
    const tableData = testCases.map(tc => [
      tc.name,
      tc.status,
      (tc.steps?.length || 0).toString(),
      ((new Date(tc.finishedAt || Date.now()).getTime() - new Date(tc.startedAt).getTime()) / 1000).toFixed(2) + 's'
    ]);

    doc.autoTable({
      head: [['Test Case', 'Status', 'Steps', 'Duration']],
      body: tableData,
      startY: yPosition,
      margin: margin,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      bodyStyles: { textColor: 0 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    doc.save(fileName);
    return { success: true };
  } catch (error) {
    console.error('PDF export error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate a CSV from test execution data
 */
export const generateCSV = (testCases, fileName = 'test-cases.csv') => {
  try {
    const headers = ['Test Case', 'Status', 'Steps', 'Duration (s)', 'Started', 'Finished'];
    const rows = testCases.map(tc => [
      tc.name,
      tc.status,
      tc.steps?.length || 0,
      ((new Date(tc.finishedAt || Date.now()).getTime() - new Date(tc.startedAt).getTime()) / 1000).toFixed(2),
      new Date(tc.startedAt).toLocaleTimeString(),
      tc.finishedAt ? new Date(tc.finishedAt).toLocaleTimeString() : '-'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { success: true };
  } catch (error) {
    console.error('CSV export error:', error);
    return { success: false, error: error.message };
  }
};
