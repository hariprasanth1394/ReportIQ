import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import {
  Box,
  Typography,
  Stack,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
} from '@mui/material';
import { StatusChip } from '../ui/StatusChip.jsx';
import { StatSummaryCard } from '../components/StatSummaryCard';
import { AISection } from '../components/AISection';
import { StepListPanel } from '../components/StepListPanel';
import { StepDetailPanel } from '../components/StepDetailPanel';
import { PageHeader } from '../components/PageHeader';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { formatDuration, formatDate, calculateDurationMs } from '../utils/formatting';
import { usePolling } from '../hooks/usePolling';

export default function ExecutionDetailPage() {
  const { runId } = useParams();
  const navigate = useNavigate();
  const [run, setRun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedTestCase, setSelectedTestCase] = useState(null);
  const [selectedStep, setSelectedStep] = useState(null);

  // Fetch run details from API
  const fetchRunDetails = async () => {
    try {
      const res = await api.get(`/api/executions/runs/${runId}`);
      
      if (res.data) {
        // Log the response for debugging
        console.log('[ExecutionDetailPage] Fetched run:', res.data);
        
        setRun(res.data);
        setError(null);
        
        // Auto-select first test case and step on initial load
        if (!selectedTestCase && res.data.testCases?.length > 0) {
          setSelectedTestCase(res.data.testCases[0]);
          if (res.data.testCases[0].steps?.length > 0) {
            setSelectedStep(res.data.testCases[0].steps[0]);
          }
        }
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) {
        setError('Run not found. It may have been deleted or not created yet.');
        setRun(null);
      } else {
        setError('Unable to load execution run. Please try again.');
      }
      console.error('Failed to fetch run details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load - separate from polling
  useEffect(() => {
    fetchRunDetails();
  }, [runId]);

  // Polling - uses custom hook to prevent flickering
  // Updates only if data actually changed
  usePolling(fetchRunDetails, {
    enabled: !!run && run.status === 'RUNNING', // Only poll while running
    interval: 5000, // 5 seconds for detail page
  });

  const filteredTestCases = useMemo(() => {
    if (!run) return [];
    return filterStatus
      ? run.testCases.filter((tc) => tc.status === filterStatus)
      : run.testCases;
  }, [run, filterStatus]);

  const metrics = useMemo(() => {
    if (!run || !run.testCases) return {};
    const passed = run.testCases.filter((tc) => tc.status === 'PASS').length;
    const failed = run.testCases.filter((tc) => tc.status === 'FAIL').length;
    const total = run.testCases.length;

    const durations = run.testCases.map((tc) => {
      const durationMs = calculateDurationMs(tc.startedAt, tc.finishedAt);
      return durationMs ? durationMs / 1000 : 0;
    });

    const avgDuration =
      durations.length > 0
        ? (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(2)
        : 0;
    const maxDuration =
      durations.length > 0 ? Math.max(...durations).toFixed(2) : 0;
    const totalSteps = run.testCases.reduce(
      (sum, tc) => sum + (tc.steps?.length || 0),
      0
    );

    return {
      passed,
      failed,
      total,
      passRate:
        total > 0 ? (((passed / total) * 100).toFixed(1)) : '0',
      avgDuration,
      maxDuration,
      totalSteps,
    };
  }, [run]);

  const exportToExcel = () => {
    if (!run) return;
    const data = filteredTestCases.map((tc) => ({
      'Test Case': tc.name,
      Status: tc.status,
      Steps: tc.steps?.length || 0,
      Duration: formatDuration(calculateDurationMs(tc.startedAt, tc.finishedAt)),
      Started: formatDate(tc.startedAt, 'time'),
      Finished: formatDate(tc.finishedAt, 'time'),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Test Cases');

    const summary = [
      ['Test Execution Details'],
      [],
      ['Browser', run.browser],
      ['Status', run.status],
      ['Started', formatDate(run.startedAt, 'full')],
      ['Finished', formatDate(run.finishedAt, 'full')],
      [],
      ['Total Test Cases', metrics.total],
      ['Passed', metrics.passed],
      ['Failed', metrics.failed],
      ['Pass Rate %', metrics.passRate],
      ['Average Duration (s)', metrics.avgDuration],
      ['Max Duration (s)', metrics.maxDuration],
      ['Total Steps', metrics.totalSteps],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summary);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    XLSX.writeFile(
      wb,
      `execution-run-${runId}-${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  const exportToPDF = () => {
    if (!run) return;
    try {
      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.text(`Test Execution Report - ${run.browser}`, 20, 20);

      doc.setFontSize(10);
      doc.text(`Status: ${run.status}`, 20, 30);
      doc.text(`Started: ${formatDate(run.startedAt, 'full')}`, 20, 37);
      doc.text(`Finished: ${formatDate(run.finishedAt, 'full')}`, 20, 44);

      doc.setFontSize(12);
      doc.text('Summary Metrics', 20, 55);

      doc.setFontSize(10);
      doc.text(`Total Test Cases: ${metrics.total}`, 25, 63);
      doc.text(`Passed: ${metrics.passed} (${metrics.passRate}%)`, 25, 70);
      doc.text(`Failed: ${metrics.failed}`, 25, 77);
      doc.text(`Average Duration: ${metrics.avgDuration}s`, 25, 84);
      doc.text(`Max Duration: ${metrics.maxDuration}s`, 25, 91);

      doc.setFontSize(12);
      doc.text('Test Cases', 20, 105);

      const tableData = filteredTestCases.map((tc) => [
        tc.name,
        tc.status,
        tc.steps?.length || 0,
        formatDuration(calculateDurationMs(tc.startedAt, tc.finishedAt)),
      ]);

      doc.autoTable({
        head: [['Test Case', 'Status', 'Steps', 'Duration']],
        body: tableData,
        startY: 110,
        margin: { left: 20, right: 20 },
        theme: 'grid',
      });

      doc.save(
        `execution-run-${runId}-${new Date().toISOString().split('T')[0]}.pdf`
      );
    } catch (err) {
      console.error('PDF export error:', err);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          py: 6,
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: '#111827', fontWeight: 600 }}
        >
          Unable to load execution run
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B7280' }}>
          {error}
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate('/execution-runs')}
          sx={{
            textTransform: 'none',
            borderRadius: '8px',
            fontWeight: 500,
          }}
        >
          Back to Execution Runs
        </Button>
      </Box>
    );
  }

  if (!run) {
    return null;
  }

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#F3F4F6',
        overflow: 'hidden',
      }}
    >
      <PageHeader
        title="Execution Details"
        subtitle={runId}
      />

      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          width: '100%',
        }}
      >
        <Box
          sx={{
            maxWidth: '1400px',
            mx: 'auto',
            px: 4,
            py: 3,
            width: '100%',
          }}
        >
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/execution-runs')}
            sx={{
              textTransform: 'none',
              mb: 3,
              color: '#2563EB',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: 'rgba(37, 99, 235, 0.04)',
              },
            }}
          >
            Back to Execution Runs
          </Button>

          {/* Execution Header Row */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: '32px',
              gap: '24px',
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: '22px',
                  fontWeight: 600,
                  color: '#111827',
                  mb: '12px',
                }}
              >
                {run.browser || 'Execution Run'}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <Typography sx={{ fontSize: '13px', color: '#6B7280' }}>
                  {run.browser || 'Unknown'} •
                </Typography>
                <Typography sx={{ fontSize: '13px', color: '#6B7280' }}>
                  Production •
                </Typography>
                <Typography sx={{ fontSize: '13px', color: '#6B7280' }}>
                  Started {formatDate(run.startedAt, 'full')} •
                </Typography>
                <Typography sx={{ fontSize: '13px', color: '#6B7280' }}>
                  Duration{' '}
                  {formatDuration(calculateDurationMs(run.startedAt, run.finishedAt))}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ pt: '2px' }}>
              <StatusChip status={run.status} />
            </Box>
          </Box>

          {/* Stat Summary Cards */}
          <Grid container spacing={2} sx={{ mb: '32px' }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatSummaryCard
                label="Total Steps"
                value={metrics.totalSteps || 0}
                variant="info"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatSummaryCard
                label="Passed"
                value={metrics.passed || 0}
                variant="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatSummaryCard
                label="Failed"
                value={metrics.failed || 0}
                variant="error"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatSummaryCard
                label="Pass Rate"
                value={metrics.passRate || '0'}
                unit="%"
                variant="warning"
              />
            </Grid>
          </Grid>

          {/* AI Section */}
          <AISection
            summary={`Execution completed with ${metrics.passed} passed and ${metrics.failed} failed tests. The execution ran across ${metrics.total} test cases with an average duration of ${metrics.avgDuration}s per test.`}
            recommendations={
              metrics.failed > 0
                ? [
                    'Review the failed test cases to identify common issues',
                    `${metrics.failed} tests failed - prioritize investigating root causes`,
                    'Consider increasing timeout values if tests are timing out',
                  ]
                : [
                    'All tests passed successfully',
                    'Execution performance is optimal',
                    'Continue monitoring this execution suite',
                  ]
            }
          />

          {/* Test Steps & Details Layout */}
          {selectedTestCase && (
            <Box sx={{ mt: '32px', mb: '32px' }}>
              <Grid container spacing={3} sx={{ gridTemplateColumns: '340px 1fr' }}>
                <Grid item sx={{ minWidth: 0 }}>
                  <StepListPanel
                    steps={
                      selectedTestCase.steps?.map((step) => ({
                        id: step.id,
                        name: step.stepName,
                        status: step.status,
                        duration: formatDuration(
                          calculateDurationMs(step.startedAt, step.finishedAt)
                        ),
                      })) || []
                    }
                    activeStepId={selectedStep?.id}
                    onStepSelect={(stepId) => {
                      const step = selectedTestCase.steps.find(
                        (s) => s.id === stepId
                      );
                      setSelectedStep(step);
                    }}
                  />
                </Grid>

                <Grid item sx={{ minWidth: 0 }}>
                  {selectedStep ? (
                    <StepDetailPanel
                      stepName={selectedStep.stepName}
                      stepStatus={selectedStep.status}
                      screenshot={selectedStep.screenshot}
                      error={selectedStep.error}
                    />
                  ) : (
                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: '18px',
                        padding: '40px',
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        backgroundColor: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '400px',
                      }}
                    >
                      <Typography
                        sx={{
                          color: '#9CA3AF',
                          fontSize: '14px',
                        }}
                      >
                        Select a step to view details
                      </Typography>
                    </Card>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Export & Filter Section */}
          <Box sx={{ mt: '32px', mb: '24px' }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: '18px',
                padding: '20px 24px',
                backgroundColor: '#F9FAFB',
                border: '1px solid rgba(0, 0, 0, 0.08)',
              }}
            >
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                alignItems="flex-end"
              >
                <FormControl
                  size="small"
                  sx={{
                    minWidth: 180,
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                  }}
                >
                  <InputLabel>Filter by Status</InputLabel>
                  <Select
                    value={filterStatus}
                    label="Filter by Status"
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <MenuItem value="">All Tests</MenuItem>
                    <MenuItem value="PASS">Passed</MenuItem>
                    <MenuItem value="FAIL">Failed</MenuItem>
                  </Select>
                </FormControl>
                <Box sx={{ flexGrow: 1 }} />
                <Button
                  startIcon={<FileDownloadIcon />}
                  variant="contained"
                  onClick={exportToExcel}
                  sx={{
                    backgroundColor: '#10B981',
                    textTransform: 'none',
                    borderRadius: '8px',
                    fontWeight: 500,
                    '&:hover': { backgroundColor: '#059669' },
                  }}
                >
                  Export Excel
                </Button>
                <Button
                  startIcon={<FileDownloadIcon />}
                  variant="contained"
                  onClick={exportToPDF}
                  sx={{
                    backgroundColor: '#3B82F6',
                    textTransform: 'none',
                    borderRadius: '8px',
                    fontWeight: 500,
                    '&:hover': { backgroundColor: '#2563EB' },
                  }}
                >
                  Export PDF
                </Button>
              </Stack>
            </Card>
          </Box>

          {/* Test Cases Table */}
          <Box>
            <Typography
              sx={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#111827',
                mb: '16px',
              }}
            >
              Test Cases{' '}
              <Typography
                component="span"
                sx={{
                  color: '#6B7280',
                  fontWeight: 500,
                  fontSize: '14px',
                }}
              >
                ({filteredTestCases.length} of {run.testCases.length})
              </Typography>
            </Typography>

            <Card
              elevation={0}
              sx={{
                borderRadius: '18px',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                backgroundColor: '#FFFFFF',
                overflow: 'hidden',
              }}
            >
              <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          backgroundColor: '#F9FAFB',
                          fontWeight: 700,
                          color: '#475569',
                          fontSize: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          py: 2,
                          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                        }}
                      >
                        Test Case
                      </TableCell>
                      <TableCell
                        sx={{
                          backgroundColor: '#F9FAFB',
                          fontWeight: 700,
                          color: '#475569',
                          fontSize: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          py: 2,
                          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                        }}
                      >
                        Status
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          backgroundColor: '#F9FAFB',
                          fontWeight: 700,
                          color: '#475569',
                          fontSize: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          py: 2,
                          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                        }}
                      >
                        Steps
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          backgroundColor: '#F9FAFB',
                          fontWeight: 700,
                          color: '#475569',
                          fontSize: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          py: 2,
                          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                        }}
                      >
                        Duration
                      </TableCell>
                      <TableCell
                        sx={{
                          backgroundColor: '#F9FAFB',
                          fontWeight: 700,
                          color: '#475569',
                          fontSize: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          py: 2,
                          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                        }}
                      >
                        Started
                      </TableCell>
                      <TableCell
                        sx={{
                          backgroundColor: '#F9FAFB',
                          fontWeight: 700,
                          color: '#475569',
                          fontSize: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          py: 2,
                          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                        }}
                      >
                        Finished
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTestCases.map((tc) => {
                      const durationMs = calculateDurationMs(tc.startedAt, tc.finishedAt);
                      const duration = formatDuration(durationMs);
                      const isSlowTest =
                        durationMs &&
                        metrics.maxDuration &&
                        durationMs / 1000 > parseFloat(metrics.maxDuration) * 0.8;

                      return (
                        <TableRow
                          key={tc.id}
                          hover
                          sx={{
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            '&:hover': {
                              backgroundColor: 'rgba(37, 99, 235, 0.04)',
                            },
                          }}
                          onClick={() => {
                            setSelectedTestCase(tc);
                            if (tc.steps?.length > 0) {
                              setSelectedStep(tc.steps[0]);
                            }
                          }}
                        >
                          <TableCell
                            sx={{
                              py: 2,
                              fontWeight: 500,
                              color: '#111827',
                            }}
                          >
                            {tc.name}
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <StatusChip status={tc.status} />
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              py: 2,
                              fontWeight: 600,
                              color: '#64748B',
                            }}
                          >
                            {tc.steps?.length || 0}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              py: 2,
                              fontWeight: 600,
                              color: isSlowTest ? '#EF4444' : '#111827',
                            }}
                          >
                            {duration}
                          </TableCell>
                          <TableCell
                            sx={{
                              py: 2,
                              fontSize: '13px',
                              color: '#6B7280',
                            }}
                          >
                            {formatDate(tc.startedAt, 'time')}
                          </TableCell>
                          <TableCell
                            sx={{
                              py: 2,
                              fontSize: '13px',
                              color: '#6B7280',
                            }}
                          >
                            {formatDate(tc.finishedAt, 'time')}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
