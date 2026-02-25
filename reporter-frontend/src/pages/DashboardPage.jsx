import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PercentIcon from '@mui/icons-material/Percent';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api } from '../api/client.js';

function getTimestamp(value) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.getTime();
}

function durationSeconds(startedAt, finishedAt) {
  const start = getTimestamp(startedAt);
  const end = getTimestamp(finishedAt);
  if (!start || !end || end <= start) return 0;
  return Math.floor((end - start) / 1000);
}

function DashboardChartCard({ title, children }) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '16px',
        p: '24px',
        mb: '24px',
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: 'none',
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#111827', mb: 2 }}>
        {title}
      </Typography>
      {children}
    </Card>
  );
}

function KpiCard({ label, value, change, positive = true, icon, tint }) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        p: 3,
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: 'none',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Box>
        <Typography variant="subtitle2" sx={{ color: '#6B7280', mb: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}>
          {value}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: positive ? '#16A34A' : '#DC2626',
            fontWeight: 600,
          }}
        >
          {change}
        </Typography>
      </Box>

      <Box
        sx={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: tint,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#374151',
        }}
      >
        {icon}
      </Box>
    </Card>
  );
}

export default function DashboardPage() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response = await api.get('/api/executions/runs');
        if (mounted) {
          setRuns(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        if (mounted) {
          setRuns([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();
    const timer = setInterval(load, 4000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  const summary = useMemo(() => {
    const totalRuns = runs.length;
    const passedRuns = runs.filter((run) => run.status === 'PASS').length;
    const failedRuns = runs.filter((run) => run.status === 'FAIL').length;
    const totalTests = runs.reduce((acc, run) => acc + Number(run.totalTests || 0), 0);
    const passedTests = runs.reduce((acc, run) => acc + Number(run.passedTests || 0), 0);
    const failedTests = runs.reduce((acc, run) => acc + Number(run.failedTests || 0), 0);
    const passRate = totalTests > 0 ? Number(((passedTests / totalTests) * 100).toFixed(1)) : 0;
    const averageDurationSeconds = totalRuns
      ? Math.round(
          runs.reduce((acc, run) => acc + durationSeconds(run.startedAt, run.finishedAt), 0) / totalRuns,
        )
      : 0;

    return {
      totalRuns,
      passedRuns,
      failedRuns,
      totalTests,
      passedTests,
      failedTests,
      passRate,
      averageDurationSeconds,
    };
  }, [runs]);

  const passRateTrendData = useMemo(() => {
    const grouped = {};

    runs.forEach((run) => {
      const source = run.startedAt || run.createdAt || run.finishedAt;
      const timestamp = getTimestamp(source);
      if (!timestamp) return;

      const date = new Date(timestamp);
      const key = date.toISOString().split('T')[0];

      if (!grouped[key]) {
        grouped[key] = {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          total: 0,
          passed: 0,
        };
      }

      grouped[key].total += Number(run.totalTests || 0);
      grouped[key].passed += Number(run.passedTests || 0);
    });

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([, item]) => ({
        date: item.date,
        passRate: item.total > 0 ? Number(((item.passed / item.total) * 100).toFixed(1)) : 0,
      }));
  }, [runs]);

  const failuresByBrowserData = useMemo(() => {
    const grouped = {};

    runs.forEach((run) => {
      const key = run.browser || 'Unknown';
      grouped[key] = (grouped[key] || 0) + Number(run.failedTests || 0);
    });

    return Object.entries(grouped).map(([name, failures]) => ({ name, failures }));
  }, [runs]);

  const tagStabilityData = useMemo(() => {
    const grouped = {};

    runs.forEach((run) => {
      const tags = Array.isArray(run.tags) && run.tags.length ? run.tags : ['untagged'];
      tags.forEach((tag) => {
        if (!grouped[tag]) {
          grouped[tag] = { total: 0, passed: 0 };
        }
        grouped[tag].total += Number(run.totalTests || 0);
        grouped[tag].passed += Number(run.passedTests || 0);
      });
    });

    return Object.entries(grouped).map(([tag, metrics]) => ({
      tag,
      stability: metrics.total > 0 ? Number(((metrics.passed / metrics.total) * 100).toFixed(1)) : 0,
    }));
  }, [runs]);

  const executionDurationData = useMemo(() => {
    const grouped = {};

    runs.forEach((run) => {
      const source = run.startedAt || run.createdAt || run.finishedAt;
      const timestamp = getTimestamp(source);
      if (!timestamp) return;

      const date = new Date(timestamp);
      const key = date.toISOString().split('T')[0];
      if (!grouped[key]) {
        grouped[key] = {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          totalSeconds: 0,
          count: 0,
        };
      }

      grouped[key].totalSeconds += durationSeconds(run.startedAt, run.finishedAt);
      grouped[key].count += 1;
    });

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([, item]) => ({
        date: item.date,
        avgDuration: item.count > 0 ? Number((item.totalSeconds / item.count).toFixed(1)) : 0,
      }));
  }, [runs]);

  if (loading && runs.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}>
          Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B7280' }}>
          SaaS execution analytics overview
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4} xl={2}>
          <KpiCard
            label="Total Runs"
            value={summary.totalRuns}
            change="+8.2%"
            positive
            icon={<PlayCircleOutlineIcon fontSize="small" />}
            tint="#E0F2FE"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} xl={2}>
          <KpiCard
            label="Passed Runs"
            value={summary.passedRuns}
            change="+6.1%"
            positive
            icon={<CheckCircleOutlineIcon fontSize="small" />}
            tint="#DCFCE7"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} xl={2}>
          <KpiCard
            label="Failed Runs"
            value={summary.failedRuns}
            change="-2.7%"
            positive={false}
            icon={<ErrorOutlineIcon fontSize="small" />}
            tint="#FEE2E2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} xl={2}>
          <KpiCard
            label="Pass Rate"
            value={`${summary.passRate}%`}
            change="+1.4%"
            positive
            icon={<PercentIcon fontSize="small" />}
            tint="#EDE9FE"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} xl={2}>
          <KpiCard
            label="Total Tests"
            value={summary.totalTests}
            change="+9.8%"
            positive
            icon={<TaskAltIcon fontSize="small" />}
            tint="#FEF3C7"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} xl={2}>
          <KpiCard
            label="Avg Duration"
            value={`${summary.averageDurationSeconds}s`}
            change="-1.1%"
            positive={false}
            icon={<TimerOutlinedIcon fontSize="small" />}
            tint="#E0E7FF"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <DashboardChartCard title="Pass Rate Trend">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={passRateTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="passRate" stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </DashboardChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <DashboardChartCard title="Failures by Browser">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={failuresByBrowserData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="failures" fill="#EF4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </DashboardChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <DashboardChartCard title="Tag Stability">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={tagStabilityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="tag" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="stability" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </DashboardChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <DashboardChartCard title="Execution Duration">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={executionDurationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="avgDuration" stroke="#7C3AED" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </DashboardChartCard>
        </Grid>
      </Grid>
    </Stack>
  );
}