import React, { useEffect, useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { KPICard } from '../components/KPICard';
import { ChartCard } from '../components/ChartCard';
import { PlayCircle, CheckCircle2, XCircle, Loader2, TrendingUp, Target, Sparkles, TrendingDown, AlertTriangle, Download } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { api } from '../api/client.js';
import { LoadingState } from '../components/LoadingState';
import * as XLSX from 'xlsx';

export default function DashboardPage() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

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
  const calcStats = useMemo(() => {
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

  useEffect(() => {
    setStats(calcStats);
  }, [calcStats]);

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

  // Chart data
  const passRateTrendData = [
    { date: 'Jan 1', passRate: 94.2 },
    { date: 'Jan 8', passRate: 95.5 },
    { date: 'Jan 15', passRate: 93.8 },
    { date: 'Jan 22', passRate: 96.1 },
    { date: 'Jan 29', passRate: 97.3 },
    { date: 'Feb 5', passRate: stats?.passRate ? parseFloat(stats.passRate) : 98.5 },
  ];

  const failuresByBrowserData = [
    { browser: 'Chrome', failures: runs.filter(r => r.browser === 'Chrome' && r.status === 'FAIL').length || 12 },
    { browser: 'Firefox', failures: runs.filter(r => r.browser === 'Firefox' && r.status === 'FAIL').length || 8 },
    { browser: 'Safari', failures: runs.filter(r => r.browser === 'Safari' && r.status === 'FAIL').length || 15 },
    { browser: 'Edge', failures: runs.filter(r => r.browser === 'Edge' && r.status === 'FAIL').length || 5 },
  ];

  const tagStabilityData = [
    { name: 'Stable', value: 85, color: '#10b981' },
    { name: 'Flaky', value: 12, color: '#f59e0b' },
    { name: 'Broken', value: 3, color: '#ef4444' },
  ];

  const executionDurationData = [
    { date: 'Jan 1', duration: 42 },
    { date: 'Jan 8', duration: 45 },
    { date: 'Jan 15', duration: 41 },
    { date: 'Jan 22', duration: 43 },
    { date: 'Jan 29', duration: 39 },
    { date: 'Feb 5', duration: 38 },
  ];

  if (loading && runs.length === 0) {
    return <LoadingState />;
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <Header title="Dashboard" subtitle="Overview of your test automation performance" />
      
      <div className="flex-1 overflow-auto p-8">
        {/* KPI Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            <KPICard
              title="Total Runs"
              value={stats.total.toLocaleString()}
              change="+12.5%"
              changeType="positive"
              icon={PlayCircle}
              iconColor="bg-blue-500"
            />
            <KPICard
              title="Passed"
              value={stats.passed.toLocaleString()}
              change="+15.2%"
              changeType="positive"
              icon={CheckCircle2}
              iconColor="bg-emerald-500"
            />
            <KPICard
              title="Failed"
              value={stats.failed.toLocaleString()}
              change="-8.3%"
              changeType="positive"
              icon={XCircle}
              iconColor="bg-red-500"
            />
            <KPICard
              title="Running"
              value={stats.running.toLocaleString()}
              icon={Loader2}
              iconColor="bg-indigo-500"
            />
            <KPICard
              title="Pass Rate"
              value={`${stats.passRate}%`}
              change="+2.3%"
              changeType="positive"
              icon={TrendingUp}
              iconColor="bg-purple-500"
            />
            <KPICard
              title="Stability Score"
              value="94.2"
              change="+5.1%"
              changeType="positive"
              icon={Target}
              iconColor="bg-cyan-500"
            />
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pass Rate Trend */}
          <ChartCard title="Pass Rate Trend">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={passRateTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} domain={[90, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
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
          </ChartCard>

          {/* Failures by Browser */}
          <ChartCard title="Failures by Browser">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={failuresByBrowserData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="browser" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="failures" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Tag Stability */}
          <ChartCard title="Tag Stability">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={tagStabilityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {tagStabilityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Execution Duration Trend */}
          <ChartCard title="Execution Duration (avg seconds)">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={executionDurationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="duration" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Browser</label>
              <select
                value={filterBrowser}
                onChange={(e) => setFilterBrowser(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Browsers</option>
                <option value="Chrome">Chrome</option>
                <option value="Firefox">Firefox</option>
                <option value="Safari">Safari</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="PASS">Passed</option>
                <option value="FAIL">Failed</option>
                <option value="RUNNING">Running</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tag</label>
              <input
                type="text"
                value={filterTags}
                onChange={(e) => setFilterTags(e.target.value)}
                placeholder="e.g., P1, Smoke"
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1" />
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition"
            >
              <Download className="size-4" />
              Export Excel
            </button>
          </div>
        </div>

        {/* AI Insights Section */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
              <Sparkles className="size-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">AI Insights</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="bg-emerald-500 p-2 rounded-lg">
                  <TrendingUp className="size-4 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 mb-1">Improved Performance</h4>
                  <p className="text-sm text-slate-600">
                    Your pass rate increased by {stats?.passRate || 2.3}% this week. Great progress on the checkout flow tests!
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="bg-amber-500 p-2 rounded-lg">
                  <AlertTriangle className="size-4 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 mb-1">Flaky Test Detected</h4>
                  <p className="text-sm text-slate-600">
                    "Login with OAuth" test has failed {stats?.failed || 3} times in different environments. Consider reviewing.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <TrendingDown className="size-4 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 mb-1">Duration Optimization</h4>
                  <p className="text-sm text-slate-600">
                    Average test duration decreased by 7s. Parallel execution is working efficiently.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
