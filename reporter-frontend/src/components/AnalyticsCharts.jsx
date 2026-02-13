import React, { useMemo } from 'react';
import { Paper, Grid, Typography, Box } from '@mui/material';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter } from 'recharts';

/**
 * Analytics card component for displaying key metrics
 */
export function AnalyticsCard({ title, value, subtitle, color = '#3b82f6', bgColor = '#f0f9ff' }) {
  return (
    <Paper sx={{ p: 2, bgcolor: bgColor, borderLeft: `4px solid ${color}` }}>
      <Typography variant="caption" color="textSecondary">{title}</Typography>
      <Typography variant="h6">{value}</Typography>
      {subtitle && <Typography variant="caption" color="textSecondary">{subtitle}</Typography>}
    </Paper>
  );
}

/**
 * Pass/Fail distribution pie chart
 */
export function StatusPieChart({ data = [], title = 'Test Status Distribution' }) {
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 350 }}>
        <Typography color="textSecondary">No data available</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );
}

/**
 * Browser/Platform distribution bar chart
 */
export function BrowserDistributionChart({ data = [], title = 'Tests by Browser' }) {
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 350 }}>
        <Typography color="textSecondary">No data available</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}

/**
 * Test results overview (passed vs failed)
 */
export function TestResultsChart({ passed = 0, failed = 0, title = 'Test Results Overview' }) {
  const data = [{ name: 'Results', Passed: passed, Failed: failed }];

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
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
  );
}

/**
 * Test duration timeline
 */
export function DurationTimelineChart({ data = [], title = 'Test Duration Timeline' }) {
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 350 }}>
        <Typography color="textSecondary">No data available</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="duration" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
}

/**
 * Execution trends over time
 */
export function ExecutionTrendsChart({ data = [], title = 'Execution Trends' }) {
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 350 }}>
        <Typography color="textSecondary">No data available</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="passed" stroke="#10b981" />
          <Line type="monotone" dataKey="failed" stroke="#ef4444" />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
}

/**
 * Step execution performance chart
 */
export function StepPerformanceChart({ data = [], title = 'Step Performance' }) {
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 350 }}>
        <Typography color="textSecondary">No data available</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" width={150} />
          <Tooltip />
          <Bar dataKey="duration" fill="#f59e0b" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}

/**
 * Flakiness analysis - test failure patterns
 */
export function FlakinessAnalysisChart({ data = [], title = 'Test Flakiness Index' }) {
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 350 }}>
        <Typography color="textSecondary">No data available</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="flakiness" fill="#ec4899" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}

/**
 * Analytics grid component that arranges multiple charts
 */
export function AnalyticsGrid({ children }) {
  return (
    <Grid container spacing={3}>
      {children}
    </Grid>
  );
}

export default {
  AnalyticsCard,
  StatusPieChart,
  BrowserDistributionChart,
  TestResultsChart,
  DurationTimelineChart,
  ExecutionTrendsChart,
  StepPerformanceChart,
  FlakinessAnalysisChart,
  AnalyticsGrid
};
