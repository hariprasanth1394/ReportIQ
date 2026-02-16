import React, { useEffect, useState, useMemo } from 'react';
import {
  Paper, Typography, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Box, Stack, Button, TextField, MenuItem, Select, FormControl, InputLabel, Grid, Card, CardContent, alpha
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { StatusChip } from '../ui/StatusChip.jsx';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import * as XLSX from 'xlsx';

// Helper function to safely format dates
const formatDate = (dateValue) => {
  if (!dateValue) return '-';
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleString();
  } catch (error) {
    return '-';
  }
};

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
      Started: formatDate(run.startedAt),
      Finished: formatDate(run.finishedAt)
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
    <Stack spacing={3}>
      {/* Header */}
      <Box>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#111827' }}>
          Test Execution Analytics
        </Typography>

        {/* Modern Stats Cards */}
        <Grid container spacing={3}>
          {/* Total Runs Card */}
          <Grid item xs={12} sm={6} md={4} lg={2}>
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
                  Total Runs
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
                    {stats.total}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Passed Card */}
          <Grid item xs={12} sm={6} md={4} lg={2}>
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
                    {stats.passed}
                  </Typography>
                  {stats.total > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TrendingUpIcon sx={{ fontSize: 16, color: '#10b981' }} />
                      <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>
                        {((stats.passed / stats.total) * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Failed Card */}
          <Grid item xs={12} sm={6} md={4} lg={2}>
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
                    {stats.failed}
                  </Typography>
                  {stats.total > 0 && stats.failed > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TrendingDownIcon sx={{ fontSize: 16, color: '#ef4444' }} />
                      <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 600 }}>
                        {((stats.failed / stats.total) * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Running Card */}
          <Grid item xs={12} sm={6} md={4} lg={2}>
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
                  Running
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mt: 1.5 }}>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 700, 
                      color: '#f59e0b',
                      lineHeight: 1,
                    }}
                  >
                    {stats.running}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Total Tests Card */}
          <Grid item xs={12} sm={6} md={4} lg={2}>
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
                    {stats.totalTests}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Pass Rate Card */}
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card 
              elevation={0}
              sx={{ 
                borderRadius: 4,
                border: '1px solid',
                borderColor: alpha('#8b5cf6', 0.1),
                bgcolor: 'white',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  borderColor: alpha('#8b5cf6', 0.3),
                  boxShadow: `0 4px 12px ${alpha('#8b5cf6', 0.15)}`,
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
                      color: '#8b5cf6',
                      lineHeight: 1,
                    }}
                  >
                    {stats.passRate}%
                  </Typography>
                  {stats.passRate >= 70 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TrendingUpIcon sx={{ fontSize: 16, color: '#10b981' }} />
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Charts */}
      {filteredRuns.length > 0 && (
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
                  Tests by Status
                </Typography>
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
                  Tests by Browser
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={browserData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
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
                  Test Results Overview
                </Typography>
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
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
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
        <Box sx={{ p: 3 }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              mb: 2.5, 
              fontWeight: 600,
              color: '#111827',
              fontSize: '0.9375rem',
            }}
          >
            Filter Execution Runs
          </Typography>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            alignItems={{ xs: 'stretch', sm: 'flex-start' }}
            flexWrap="wrap"
            useFlexGap
          >
            <TextField
              label="From Date"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              sx={{ 
                minWidth: 160,
                flex: { xs: '1 1 100%', sm: '0 1 160px' },
              }}
            />
            <TextField
              label="To Date"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              sx={{ 
                minWidth: 160,
                flex: { xs: '1 1 100%', sm: '0 1 160px' },
              }}
            />
            <FormControl 
              size="small" 
              sx={{ 
                minWidth: 140,
                flex: { xs: '1 1 100%', sm: '0 1 140px' },
              }}
            >
              <InputLabel>Browser</InputLabel>
              <Select 
                value={filterBrowser} 
                label="Browser" 
                onChange={(e) => setFilterBrowser(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="chrome">Chrome</MenuItem>
                <MenuItem value="firefox">Firefox</MenuItem>
                <MenuItem value="safari">Safari</MenuItem>
              </Select>
            </FormControl>
            <FormControl 
              size="small" 
              sx={{ 
                minWidth: 140,
                flex: { xs: '1 1 100%', sm: '0 1 140px' },
              }}
            >
              <InputLabel>Status</InputLabel>
              <Select 
                value={filterStatus} 
                label="Status" 
                onChange={(e) => setFilterStatus(e.target.value)}
              >
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
              sx={{ 
                minWidth: 140,
                flex: { xs: '1 1 100%', sm: '0 1 140px' },
              }}
            />
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
                px: 3,
                alignSelf: { xs: 'stretch', sm: 'flex-start' },
                '&:hover': { bgcolor: '#059669' },
              }}
            >
              Export Excel
            </Button>
          </Stack>
        </Box>
      </Card>

      {/* Table */}
      <Box>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              color: '#111827',
              fontSize: '1.125rem',
            }}
          >
            Test Execution Runs 
            <Typography 
              component="span" 
              sx={{ 
                ml: 1, 
                color: '#64748b', 
                fontWeight: 500,
                fontSize: '0.95rem',
              }}
            >
              ({filteredRuns.length})
            </Typography>
          </Typography>
          {(filterBrowser || filterStatus || filterTags || dateFrom || dateTo) && (
            <Button 
              size="small" 
              variant="outlined"
              sx={{ 
                textTransform: 'none',
                borderRadius: 2,
              }}
              onClick={() => {
                setFilterBrowser('');
                setFilterStatus('');
                setFilterTags('');
                setDateFrom('');
                setDateTo('');
              }}
            >
              Clear Filters
            </Button>
          )}
        </Stack>

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
                    Browser
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
                    Tags
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
                    Tests
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
                    Pass / Fail
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
                {filteredRuns.length > 0 ? filteredRuns.map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      '&:hover': { 
                        bgcolor: alpha('#2563eb', 0.04),
                      },
                    }}
                    onClick={() => navigate(`/runs/${row.id}`)}
                  >
                    <TableCell sx={{ py: 2.5 }}>
                      <Chip 
                        label={row.browser} 
                        size="small" 
                        sx={{ 
                          fontWeight: 500,
                          textTransform: 'capitalize',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 2.5 }}>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {row.tags && row.tags.length > 0 ? (
                          row.tags.map((tag, idx) => (
                            <Chip 
                              key={idx} 
                              label={tag} 
                              size="small" 
                              variant="outlined" 
                              color="primary"
                              sx={{ 
                                fontSize: '0.75rem',
                                height: 24,
                              }}
                            />
                          ))
                        ) : (
                          <Typography variant="caption" color="text.secondary">-</Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ py: 2.5 }}>
                      <StatusChip status={row.status} />
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2.5, fontWeight: 600, color: '#111827' }}>
                      {row.totalTests || row.testCaseCount || 0}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2.5 }}>
                      <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                        <Chip 
                          label={`✓ ${row.passedTests || row.passCount || 0}`} 
                          size="small" 
                          sx={{
                            bgcolor: alpha('#10b981', 0.1),
                            color: '#059669',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            height: 24,
                            '& .MuiChip-label': { px: 1.5 },
                          }}
                        />
                        {(row.failedTests || row.failCount || 0) > 0 && (
                          <Chip 
                            label={`✗ ${row.failedTests || row.failCount || 0}`} 
                            size="small" 
                            sx={{
                              bgcolor: alpha('#ef4444', 0.1),
                              color: '#dc2626',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              height: 24,
                              '& .MuiChip-label': { px: 1.5 },
                            }}
                          />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ py: 2.5, fontSize: '0.875rem', color: '#64748b' }}>
                      {formatDate(row.startedAt)}
                    </TableCell>
                    <TableCell sx={{ py: 2.5, fontSize: '0.875rem', color: '#64748b' }}>
                      {formatDate(row.finishedAt)}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell 
                      colSpan={7} 
                      align="center" 
                      sx={{ 
                        py: 8, 
                        color: '#9ca3af',
                        fontSize: '0.95rem',
                      }}
                    >
                      No execution runs found. Run your tests to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>
    </Stack>
  );
}
