import React, { useEffect, useState, useMemo } from 'react';
import {
  Paper, Typography, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Box, Stack, Button, TextField, MenuItem, Select, FormControl, InputLabel, Grid, Card, CardContent, alpha
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { StatusChip } from '../ui/StatusChip.jsx';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

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

  // Pass rate trend by execution date
  const passRateTrendData = useMemo(() => {
    const byDate = {};

    filteredRuns.forEach((run) => {
      const sourceDate = run.startedAt || run.createdAt || run.finishedAt;
      if (!sourceDate) return;

      const parsedDate = new Date(sourceDate);
      if (isNaN(parsedDate.getTime())) return;

      const dateKey = parsedDate.toISOString().split('T')[0];
      const displayDate = parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const totalTests = run.totalTests || run.testCaseCount || 0;
      const passedTests = run.passedTests || run.passCount || 0;

      if (!byDate[dateKey]) {
        byDate[dateKey] = { date: displayDate, totalTests: 0, passedTests: 0 };
      }

      byDate[dateKey].totalTests += totalTests;
      byDate[dateKey].passedTests += passedTests;
    });

    const trend = Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([, entry]) => ({
        date: entry.date,
        passRate: entry.totalTests > 0 ? Number(((entry.passedTests / entry.totalTests) * 100).toFixed(1)) : 0,
      }));

    if (trend.length > 0) return trend;

    return [{ date: 'Now', passRate: Number(stats.passRate) || 0 }];
  }, [filteredRuns, stats.passRate]);

  // Failure count by browser
  const failuresByBrowserData = useMemo(() => {
    const dist = {};

    filteredRuns.forEach((run) => {
      const browserName = run.browser || 'Unknown';
      const failedTests = Number(run.failedTests || run.failCount || (run.status === 'FAIL' ? 1 : 0));
      dist[browserName] = (dist[browserName] || 0) + failedTests;
    });

    return Object.entries(dist)
      .map(([name, failures]) => ({ name, failures }))
      .sort((a, b) => b.failures - a.failures);
  }, [filteredRuns]);

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
        <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 700, color: '#0f172a' }}>
          Dashboard
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: '#64748b' }}>
          Overview of your test automation performance
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
                  Pass Rate Trend
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={passRateTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="passRate"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={{ fill: '#2563eb', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
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
                  Failures by Browser
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={failuresByBrowserData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="failures" fill="#ef4444" radius={[8, 8, 0, 0]} />
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

      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'white',
          p: 3,
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 0.5 }}>
              Execution Runs moved to dedicated tab
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Open the Execution Runs tab from the sidebar for filters, full run list, and comparisons.
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => navigate('/execution-runs')}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              fontWeight: 600,
              px: 3,
            }}
          >
            Go to Execution Runs
          </Button>
        </Stack>
      </Card>
    </Stack>
  );
}
