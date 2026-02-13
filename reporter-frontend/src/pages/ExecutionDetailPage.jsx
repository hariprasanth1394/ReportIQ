import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { Paper, Typography, Stack, Chip, Divider, Box, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Grid, TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { StatusChip } from '../ui/StatusChip.jsx';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
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
    <Stack spacing={4}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ textTransform: 'none' }}
        >
          Back to Dashboard
        </Button>
      </Stack>

      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="h5">Execution Run Details</Typography>
        <Chip label={run.browser} size="small" />
        <StatusChip status={run.status} />
      </Stack>

      <Typography variant="body2" color="text.secondary">
        Started {run.startedAt ? new Date(run.startedAt).toLocaleString() : '-'}
        {run.finishedAt ? ` • Finished ${new Date(run.finishedAt).toLocaleString()}` : ' • Running'}
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, bgcolor: '#f0f9ff', borderLeft: '4px solid #3b82f6' }}>
            <Typography variant="caption" color="textSecondary">Total Tests</Typography>
            <Typography variant="h6">{metrics.total}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, bgcolor: '#f0fdf4', borderLeft: '4px solid #10b981' }}>
            <Typography variant="caption" color="textSecondary">Passed</Typography>
            <Typography variant="h6">{metrics.passed}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, bgcolor: '#fef2f2', borderLeft: '4px solid #ef4444' }}>
            <Typography variant="caption" color="textSecondary">Failed</Typography>
            <Typography variant="h6">{metrics.failed}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, bgcolor: '#f3f4f6', borderLeft: '4px solid #6366f1' }}>
            <Typography variant="caption" color="textSecondary">Pass Rate</Typography>
            <Typography variant="h6">{metrics.passRate}%</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, bgcolor: '#fef3c7', borderLeft: '4px solid #f59e0b' }}>
            <Typography variant="caption" color="textSecondary">Avg Duration</Typography>
            <Typography variant="h6">{metrics.avgDuration}s</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts */}
      {metrics.timelineData && metrics.timelineData.length > 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Test Status Distribution</Typography>
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
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Test Duration Timeline</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics.timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="duration" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Filters & Export */}
      <Paper sx={{ p: 3, bgcolor: '#f9fafb' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-end">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select value={filterStatus} label="Filter by Status" onChange={(e) => setFilterStatus(e.target.value)}>
              <MenuItem value="">All Tests</MenuItem>
              <MenuItem value="PASS">Passed</MenuItem>
              <MenuItem value="FAIL">Failed</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ flexGrow: 1 }} />
          <Button startIcon={<FileDownloadIcon />} variant="contained" onClick={exportToExcel} sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}>
            Export Excel
          </Button>
          <Button startIcon={<FileDownloadIcon />} variant="contained" onClick={exportToPDF} sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}>
            Export PDF
          </Button>
        </Stack>
      </Paper>

      {/* Test Cases Table */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Test Cases ({filteredTestCases.length} of {run.testCases.length})
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell><strong>Test Case</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Steps</strong></TableCell>
                <TableCell align="right"><strong>Duration</strong></TableCell>
                <TableCell><strong>Started</strong></TableCell>
                <TableCell><strong>Finished</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTestCases.map((tc) => {
                const duration = ((new Date(tc.finishedAt || Date.now()).getTime() - new Date(tc.startedAt).getTime()) / 1000).toFixed(2);
                return (
                  <TableRow
                    key={tc.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/runs/${runId}/test-cases/${tc.id}`)}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>{tc.name}</TableCell>
                    <TableCell><StatusChip status={tc.status} /></TableCell>
                    <TableCell align="center">{tc.steps?.length || 0}</TableCell>
                    <TableCell align="right" sx={{ color: duration > metrics.maxDuration * 0.8 ? '#ef4444' : 'inherit' }}>{duration}s</TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>{new Date(tc.startedAt).toLocaleTimeString()}</TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>{tc.finishedAt ? new Date(tc.finishedAt).toLocaleTimeString() : '-'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Stack>
  );
}
