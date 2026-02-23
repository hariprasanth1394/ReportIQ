import React from 'react';
import { Header } from '../components/Header';
import { KPICard } from '../components/KPICard';
import { ChartCard } from '../components/ChartCard';
import { PlayCircle, CheckCircle2, XCircle, Loader2, TrendingUp, Target, Sparkles, TrendingDown, AlertTriangle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function DashboardPage() {
  // Mock data for charts
  const passRateTrendData = [
    { date: 'Jan 1', passRate: 94.2 },
    { date: 'Jan 8', passRate: 95.5 },
    { date: 'Jan 15', passRate: 93.8 },
    { date: 'Jan 22', passRate: 96.1 },
    { date: 'Jan 29', passRate: 97.3 },
    { date: 'Feb 5', passRate: 98.5 },
  ];

  const failuresByBrowserData = [
    { browser: 'Chrome', failures: 12 },
    { browser: 'Firefox', failures: 8 },
    { browser: 'Safari', failures: 15 },
    { browser: 'Edge', failures: 5 },
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

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <Header title="Dashboard" subtitle="Overview of your test automation performance" />
      
      <div className="flex-1 overflow-auto p-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <KPICard
            title="Total Runs"
            value="2,451"
            change="+12.5%"
            changeType="positive"
            icon={PlayCircle}
            iconColor="bg-blue-500"
          />
          <KPICard
            title="Passed"
            value="2,415"
            change="+15.2%"
            changeType="positive"
            icon={CheckCircle2}
            iconColor="bg-emerald-500"
          />
          <KPICard
            title="Failed"
            value="24"
            change="-8.3%"
            changeType="positive"
            icon={XCircle}
            iconColor="bg-red-500"
          />
          <KPICard
            title="Running"
            value="12"
            icon={Loader2}
            iconColor="bg-indigo-500"
          />
          <KPICard
            title="Pass Rate"
            value="98.5%"
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
                    borderRadius: '12px',
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
                    borderRadius: '12px',
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
                    borderRadius: '12px',
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
                    borderRadius: '12px',
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

        {/* AI Insights Section */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-xl">
              <Sparkles className="size-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">AI Insights</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="bg-emerald-500 p-2 rounded-xl">
                  <TrendingUp className="size-4 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 mb-1">Improved Performance</h4>
                  <p className="text-sm text-slate-600">
                    Your pass rate increased by 2.3% this week. Great progress on the checkout flow tests!
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="bg-amber-500 p-2 rounded-xl">
                  <AlertTriangle className="size-4 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 mb-1">Flaky Test Detected</h4>
                  <p className="text-sm text-slate-600">
                    "Login with OAuth" test has failed 3 times in different environments. Consider reviewing.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-500 p-2 rounded-xl">
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