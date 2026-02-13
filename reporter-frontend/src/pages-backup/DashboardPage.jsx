import React, { useEffect, useState, useMemo } from 'react';
import {
  Paper, Typography, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Box, Stack, Button, TextField, MenuItem, Select, FormControl, InputLabel, Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { StatusChip } from '../ui/StatusChip.jsx';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import * as XLSX from 'xlsx';

export default function DashboardPage() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Filter states
  const [filterBrowser, setFilterBrowser] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTags, setFilterTags] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get('/api/executions/runs');
        if (mounted) setRuns(res.data || []);
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
  }, []);

  // Apply filters
  const filteredRuns = useMemo(() => {
    return runs.filter(run => {
      if (filterBrowser && run.browser !== filterBrowser) return false;
      if (filterStatus && run.status !== filterStatus) return false;
      if (filterTags && !run.tags?.some(tag => tag.toLowerCase().includes(filterTags.toLowerCase()))) return false;
      
      if (dateFrom || dateTo) {
        const runDate = new Date(run.startedAt);
        if (dateFrom && runDate < new Date(dateFrom)) return false;
        if (dateTo) {
          const endOfDay = new Date(dateTo);
          endOfDay.setHours(23, 59, 59, 999);
          if (runDate > endOfDay) return false;
        }
      }
      
      return true;
    });
  }, [runs, filterBrowser, filterStatus, filterTags, dateFrom, dateTo]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredRuns.length;
    const passed = filteredRuns.filter(r => r.status === 'PASS').length;
    const failed = filteredRuns.filter(r => r.status === 'FAIL').length;
    const running = filteredRuns.filter(r => r.status === 'RUNNING').length;
    
    const totalTests = filteredRuns.reduce((sum, r) => sum + (r.totalTests || r.testCaseCount || 0), 0);
    const passedTests = filteredRuns.reduce((sum, r) => sum + (r.passedTests || r.passCount || 0), 0);
    const failedTests = filteredRuns.reduce((sum, r) => sum + (r.failedTests || r.failCount || 0), 0);

    return {
      total, passed, failed, running, totalTests, passedTests, failedTests,
      passRate: totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0
    };
  }, [filteredRuns]);

  // Browser distribution data
  const browserData = useMemo(() => {
    const dist = {};
    filteredRuns.forEach(run => {
      dist[run.browser] = (dist[run.browser] || 0) + 1;
    });
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  }, [filteredRuns]);

  // Status distribution
  const statusData = useMemo(() => {
    return [
      { name: 'Passed', value: stats.passed, color: '#10b981' },
      { name: 'Failed', value: stats.failed, color: '#ef4444' },
      { name: 'Running', value: stats.running, color: '#f59e0b' }
    ].filter(s => s.value > 0);
  }, [stats]);

  // Export to Excel
  const exportToExcel = () => {
    const data = filteredRuns.map(run => ({
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
    
    XLSX.writeFile(wb, `test-execution-report-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading && runs.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={4}>
      {/* Header with Stats */}
      <Box>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>Test Execution Analytics</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2, bgcolor: '#f0f9ff', borderLeft: '4px solid #3b82f6' }}>
              <Typography variant="caption" color="textSecondary">Total Runs</Typography>
              <Typography variant="h6">{stats.total}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2, bgcolor: '#f0fdf4', borderLeft: '4px solid #10b981' }}>
              <Typography variant="caption" color="textSecondary">Passed</Typography>
              <Typography variant="h6">{stats.passed}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2, bgcolor: '#fef2f2', borderLeft: '4px solid #ef4444' }}>
              <Typography variant="caption" color="textSecondary">Failed</Typography>
              <Typography variant="h6">{stats.failed}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2, bgcolor: '#fffbeb', borderLeft: '4px solid #f59e0b' }}>
              <Typography variant="caption" color="textSecondary">Running</Typography>
              <Typography variant="h6">{stats.running}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2, bgcolor: '#f3f4f6', borderLeft: '4px solid #6366f1' }}>
              <Typography variant="caption" color="textSecondary">Pass Rate</Typography>
              <Typography variant="h6">{stats.passRate}%</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Charts */}
      {filteredRuns.length > 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Tests by Status</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                    {statusData.map((entry, index) => (
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
              <Typography variant="h6" sx={{ mb: 2 }}>Tests by Browser</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={browserData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Test Results Overview</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[{ name: 'Results', Passed: stats.passedTests, Failed: stats.failedTests }]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Passed" fill="#10b981" />
                  <Bar dataKey="Failed" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Paper sx={{ p: 3, bgcolor: '#f9fafb' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-end">
          <TextField
            label="From Date"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ minWidth: 150 }}
          />
          <TextField
            label="To Date"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ minWidth: 150 }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Browser</InputLabel>
            <Select value={filterBrowser} label="Browser" onChange={(e) => setFilterBrowser(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="chrome">Chrome</MenuItem>
              <MenuItem value="firefox">Firefox</MenuItem>
              <MenuItem value="safari">Safari</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select value={filterStatus} label="Status" onChange={(e) => setFilterStatus(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="PASS">Passed</MenuItem>
              <MenuItem value="FAIL">Failed</MenuItem>
              <MenuItem value="RUNNING">Running</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Tag"
            value={filterTags}
            onChange={(e) => setFilterTags(e.target.value)}
            size="small"
            placeholder="e.g., P1, Smoke"
            sx={{ minWidth: 120 }}
          />
          <Box sx={{ flexGrow: 1 }} />
          <Button startIcon={<FileDownloadIcon />} variant="contained" onClick={exportToExcel} sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}>
            Export Excel
          </Button>
        </Stack>
      </Paper>

      {/* Table */}
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="h6">Test Execution Runs ({filteredRuns.length})</Typography>
        {(filterBrowser || filterStatus || filterTags || dateFrom || dateTo) && (
          <Button size="small" onClick={() => {
            setFilterBrowser('');
            setFilterStatus('');
            setFilterTags('');
            setDateFrom('');
            setDateTo('');
          }}>
            Clear Filters
          </Button>
        )}
      </Stack>

      <TableContainer component={Paper} elevation={0}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8fafc' }}>
              <TableCell><strong>Browser</strong></TableCell>
              <TableCell><strong>Tags</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="center"><strong>Tests</strong></TableCell>
              <TableCell align="center"><strong>Pass / Fail</strong></TableCell>
              <TableCell><strong>Started</strong></TableCell>
              <TableCell><strong>Finished</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRuns.length > 0 ? filteredRuns.map((row) => (
              <TableRow
                key={row.id}
                hover
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f1f5f9' } }}
                onClick={() => navigate(`/runs/${row.id}`)}
              >
                <TableCell><Chip label={row.browser} size="small" /></TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                    {row.tags && row.tags.length > 0 ? (
                      row.tags.map((tag, idx) => (
                        <Chip key={idx} label={tag} size="small" variant="outlined" color="primary" />
                      ))
                    ) : (
                      <Typography variant="caption" color="text.secondary">-</Typography>
                    )}
                  </Stack>
                </TableCell>
                <TableCell><StatusChip status={row.status} /></TableCell>
                <TableCell align="center">{row.totalTests || row.testCaseCount || 0}</TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                    <Chip label={`✓ ${row.passedTests || row.passCount || 0}`} size="small" color="success" variant="outlined" />
                    {(row.failedTests || row.failCount || 0) > 0 && <Chip label={`✗ ${row.failedTests || row.failCount || 0}`} size="small" color="error" variant="outlined" />}
                  </Stack>
                </TableCell>
                <TableCell sx={{ fontSize: '0.85rem' }}>{row.startedAt ? new Date(row.startedAt).toLocaleString() : '-'}</TableCell>
                <TableCell sx={{ fontSize: '0.85rem' }}>{row.finishedAt ? new Date(row.finishedAt).toLocaleString() : '-'}</TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: '#9ca3af' }}>
                  No execution runs found. Run your tests to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
