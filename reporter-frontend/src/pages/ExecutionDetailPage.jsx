import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { Paper, Typography, Stack, Chip, Divider, Box, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Grid, TextField, MenuItem, Select, FormControl, InputLabel, Card, CardContent, alpha } from '@mui/material';
import { StatusChip } from '../ui/StatusChip.jsx';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

export default function ExecutionDetailPage() {
  const { runId } = useParams();
  const navigate = useNavigate();
  const [run, setRun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get(`/api/executions/runs/${runId}`);
        if (mounted) setRun(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    const timer = setInterval(load, 4000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [runId]);

  // Filter test cases
  const filteredTestCases = useMemo(() => {
    if (!run) return [];
    return filterStatus ? run.testCases.filter(tc => tc.status === filterStatus) : run.testCases;
  }, [run, filterStatus]);

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!run || !run.testCases) return {};
    const passed = run.testCases.filter(tc => tc.status === 'PASS').length;
    const failed = run.testCases.filter(tc => tc.status === 'FAIL').length;
    const total = run.testCases.length;

    // Calculate durations
    const durations = run.testCases.map(tc => {
      const start = new Date(tc.startedAt).getTime();
      const end = tc.finishedAt ? new Date(tc.finishedAt).getTime() : Date.now();
      return (end - start) / 1000; // Convert to seconds
    });

    const avgDuration = durations.length > 0 ? (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(2) : 0;
    const maxDuration = durations.length > 0 ? Math.max(...durations).toFixed(2) : 0;
    const totalSteps = run.testCases.reduce((sum, tc) => sum + (tc.steps?.length || 0), 0);

    // Timeline data
    const timelineData = run.testCases.map((tc, idx) => ({
      name: `TC ${idx + 1}`,
      duration: parseFloat(((new Date(tc.finishedAt || Date.now()).getTime() - new Date(tc.startedAt).getTime()) / 1000).toFixed(2))
    }));

    // Status distribution
    const statusData = [
      { name: 'Passed', value: passed, color: '#10b981' },
      { name: 'Failed', value: failed, color: '#ef4444' }
    ].filter(s => s.value > 0);

    return {
      passed, failed, total, passRate: total > 0 ? ((passed / total) * 100).toFixed(1) : 0,
      avgDuration, maxDuration, totalSteps,
      timelineData, statusData
    };
  }, [run]);

  // Export to Excel
  const exportToExcel = () => {
    if (!run) return;
    const data = filteredTestCases.map(tc => ({
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
      ['Total Test Cases', metrics.total],
      ['Passed', metrics.passed],
      ['Failed', metrics.failed],
      ['Pass Rate %', metrics.passRate],
      ['Average Duration (s)', metrics.avgDuration],
      ['Max Duration (s)', metrics.maxDuration],
      ['Total Steps', metrics.totalSteps]
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summary);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    XLSX.writeFile(wb, `execution-run-${runId}-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Export to PDF
  const exportToPDF = () => {
    if (!run) return;
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(16);
      doc.text(`Test Execution Report - ${run.browser}`, 20, 20);
      
      doc.setFontSize(10);
      doc.text(`Status: ${run.status}`, 20, 30);
      doc.text(`Started: ${new Date(run.startedAt).toLocaleString()}`, 20, 37);
      doc.text(`Finished: ${run.finishedAt ? new Date(run.finishedAt).toLocaleString() : 'Running'}`, 20, 44);

      // Summary metrics
      doc.setFontSize(12);
      doc.text('Summary Metrics', 20, 55);
      
      doc.setFontSize(10);
      doc.text(`Total Test Cases: ${metrics.total}`, 25, 63);
      doc.text(`Passed: ${metrics.passed} (${metrics.passRate}%)`, 25, 70);
      doc.text(`Failed: ${metrics.failed}`, 25, 77);
      doc.text(`Average Duration: ${metrics.avgDuration}s`, 25, 84);
      doc.text(`Max Duration: ${metrics.maxDuration}s`, 25, 91);

      // Test cases table
      doc.setFontSize(12);
      doc.text('Test Cases', 20, 105);
      
      const tableData = filteredTestCases.map(tc => [
        tc.name,
        tc.status,
        tc.steps?.length || 0,
        ((new Date(tc.finishedAt || Date.now()).getTime() - new Date(tc.startedAt).getTime()) / 1000).toFixed(2) + 's'
      ]);

      doc.autoTable({
        head: [['Test Case', 'Status', 'Steps', 'Duration']],
        body: tableData,
        startY: 110,
        margin: { left: 20, right: 20 },
        theme: 'grid'
      });

      doc.save(`execution-run-${runId}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
    }
  };

  if (loading || !run) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Stack direction="row" spacing={2} alignItems="center">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          variant="outlined"
          sx={{ 
            textTransform: 'none',
            borderRadius: 2,
            fontWeight: 500,
          }}
        >
          Back to Dashboard
        </Button>
      </Stack>

      <Box>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600, 
              color: '#111827',
            }}
          >
            Execution Run Details
          </Typography>
          <Chip 
            label={run.browser} 
            size="small" 
            sx={{ 
              textTransform: 'capitalize',
              fontWeight: 500,
            }}
          />
          <StatusChip status={run.status} />
        </Stack>

        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem' }}>
          Started {run.startedAt ? new Date(run.startedAt).toLocaleString() : '-'}
          {run.finishedAt ? ` • Finished ${new Date(run.finishedAt).toLocaleString()}` : ' • Running'}
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3}>
        {/* Total Tests Card */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: 4,
              border: '1px solid',
              borderColor: alpha('#2563eb', 0.1),
              bgcolor: 'white',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                borderColor: alpha('#2563eb', 0.3),
                boxShadow: `0 4px 12px ${alpha('#2563eb', 0.15)}`,
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#64748b', 
                  fontWeight: 600, 
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontSize: '0.7rem',
                }}
              >
                Total Tests
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mt: 1.5 }}>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#111827',
                    lineHeight: 1,
                  }}
                >
                  {metrics.total}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Passed Card */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: 4,
              border: '1px solid',
              borderColor: alpha('#10b981', 0.1),
              bgcolor: 'white',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                borderColor: alpha('#10b981', 0.3),
                boxShadow: `0 4px 12px ${alpha('#10b981', 0.15)}`,
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#64748b', 
                  fontWeight: 600, 
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontSize: '0.7rem',
                }}
              >
                Passed
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mt: 1.5 }}>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#10b981',
                    lineHeight: 1,
                  }}
                >
                  {metrics.passed}
                </Typography>
                {metrics.total > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TrendingUpIcon sx={{ fontSize: 16, color: '#10b981' }} />
                    <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>
                      {((metrics.passed / metrics.total) * 100).toFixed(0)}%
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Failed Card */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: 4,
              border: '1px solid',
              borderColor: alpha('#ef4444', 0.1),
              bgcolor: 'white',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                borderColor: alpha('#ef4444', 0.3),
                boxShadow: `0 4px 12px ${alpha('#ef4444', 0.15)}`,
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#64748b', 
                  fontWeight: 600, 
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontSize: '0.7rem',
                }}
              >
                Failed
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mt: 1.5 }}>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#ef4444',
                    lineHeight: 1,
                  }}
                >
                  {metrics.failed}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Pass Rate Card */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: 4,
              border: '1px solid',
              borderColor: alpha('#6366f1', 0.1),
              bgcolor: 'white',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                borderColor: alpha('#6366f1', 0.3),
                boxShadow: `0 4px 12px ${alpha('#6366f1', 0.15)}`,
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#64748b', 
                  fontWeight: 600, 
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontSize: '0.7rem',
                }}
              >
                Pass Rate
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mt: 1.5 }}>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#6366f1',
                    lineHeight: 1,
                  }}
                >
                  {metrics.passRate}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Avg Duration Card */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: 4,
              border: '1px solid',
              borderColor: alpha('#f59e0b', 0.1),
              bgcolor: 'white',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                borderColor: alpha('#f59e0b', 0.3),
                boxShadow: `0 4px 12px ${alpha('#f59e0b', 0.15)}`,
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#64748b', 
                  fontWeight: 600, 
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontSize: '0.7rem',
                }}
              >
                Avg Duration
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mt: 1.5 }}>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#f59e0b',
                    lineHeight: 1,
                    fontSize: '2rem',
                  }}
                >
                  {metrics.avgDuration}
                  <Typography 
                    component="span" 
                    sx={{ 
                      fontSize: '1rem', 
                      fontWeight: 500, 
                      color: '#64748b',
                      ml: 0.5,
                    }}
                  >
                    s
                  </Typography>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      {metrics.timelineData && metrics.timelineData.length > 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card 
              elevation={0}
              sx={{ 
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'white',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 3, 
                    fontWeight: 600,
                    color: '#111827',
                    fontSize: '1.125rem',
                  }}
                >
                  Test Status Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={metrics.statusData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                      {metrics.statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card 
              elevation={0}
              sx={{ 
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'white',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 3, 
                    fontWeight: 600,
                    color: '#111827',
                    fontSize: '1.125rem',
                  }}
                >
                  Test Duration Timeline
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metrics.timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="duration" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters & Export */}
      <Paper 
        sx={{ 
          p: 3, 
          bgcolor: '#f9fafb',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-end">
          <FormControl 
            size="small" 
            sx={{ 
              minWidth: 150,
              bgcolor: 'white',
              borderRadius: 2,
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
              bgcolor: '#10b981', 
              textTransform: 'none',
              borderRadius: 2,
              fontWeight: 500,
              '&:hover': { bgcolor: '#059669' },
            }}
          >
            Export Excel
          </Button>
          <Button 
            startIcon={<FileDownloadIcon />} 
            variant="contained" 
            onClick={exportToPDF} 
            sx={{ 
              bgcolor: '#3b82f6',
              textTransform: 'none',
              borderRadius: 2,
              fontWeight: 500,
              '&:hover': { bgcolor: '#2563eb' },
            }}
          >
            Export PDF
          </Button>
        </Stack>
      </Paper>

      {/* Test Cases Table */}
      <Box>
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2, 
            fontWeight: 600, 
            color: '#111827',
            fontSize: '1.125rem',
          }}
        >
          Test Cases 
          <Typography 
            component="span" 
            sx={{ 
              ml: 1, 
              color: '#64748b', 
              fontWeight: 500,
              fontSize: '0.95rem',
            }}
          >
            ({filteredTestCases.length} of {run.testCases.length})
          </Typography>
        </Typography>

        <Card 
          elevation={0}
          sx={{ 
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'white',
            overflow: 'hidden',
          }}
        >
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell 
                    sx={{ 
                      bgcolor: '#f8fafc',
                      fontWeight: 700,
                      color: '#475569',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      py: 2,
                      borderBottom: '2px solid',
                      borderColor: 'divider',
                    }}
                  >
                    Test Case
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      bgcolor: '#f8fafc',
                      fontWeight: 700,
                      color: '#475569',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      py: 2,
                      borderBottom: '2px solid',
                      borderColor: 'divider',
                    }}
                  >
                    Status
                  </TableCell>
                  <TableCell 
                    align="center"
                    sx={{ 
                      bgcolor: '#f8fafc',
                      fontWeight: 700,
                      color: '#475569',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      py: 2,
                      borderBottom: '2px solid',
                      borderColor: 'divider',
                    }}
                  >
                    Steps
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{ 
                      bgcolor: '#f8fafc',
                      fontWeight: 700,
                      color: '#475569',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      py: 2,
                      borderBottom: '2px solid',
                      borderColor: 'divider',
                    }}
                  >
                    Duration
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      bgcolor: '#f8fafc',
                      fontWeight: 700,
                      color: '#475569',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      py: 2,
                      borderBottom: '2px solid',
                      borderColor: 'divider',
                    }}
                  >
                    Started
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      bgcolor: '#f8fafc',
                      fontWeight: 700,
                      color: '#475569',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      py: 2,
                      borderBottom: '2px solid',
                      borderColor: 'divider',
                    }}
                  >
                    Finished
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTestCases.map((tc) => {
                  const duration = ((new Date(tc.finishedAt || Date.now()).getTime() - new Date(tc.startedAt).getTime()) / 1000).toFixed(2);
                  const isSlowTest = duration > metrics.maxDuration * 0.8;
                  
                  return (
                    <TableRow
                      key={tc.id}
                      hover
                      sx={{ 
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        '&:hover': { 
                          bgcolor: alpha('#2563eb', 0.04),
                        },
                      }}
                      onClick={() => navigate(`/runs/${runId}/test-cases/${tc.id}`)}
                    >
                      <TableCell sx={{ py: 2.5, fontWeight: 500, color: '#111827' }}>
                        {tc.name}
                      </TableCell>
                      <TableCell sx={{ py: 2.5 }}>
                        <StatusChip status={tc.status} />
                      </TableCell>
                      <TableCell align="center" sx={{ py: 2.5, fontWeight: 600, color: '#64748b' }}>
                        {tc.steps?.length || 0}
                      </TableCell>
                      <TableCell 
                        align="right" 
                        sx={{ 
                          py: 2.5,
                          fontWeight: 600,
                          color: isSlowTest ? '#ef4444' : '#111827',
                        }}
                      >
                        {duration}s
                      </TableCell>
                      <TableCell sx={{ py: 2.5, fontSize: '0.875rem', color: '#64748b' }}>
                        {new Date(tc.startedAt).toLocaleTimeString()}
                      </TableCell>
                      <TableCell sx={{ py: 2.5, fontSize: '0.875rem', color: '#64748b' }}>
                        {tc.finishedAt ? new Date(tc.finishedAt).toLocaleTimeString() : '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>
    </Stack>
  );
}
