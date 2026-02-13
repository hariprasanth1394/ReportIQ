import React, { useState } from 'react';
import { Header } from '../components/Header';
import { StatusBadge } from '../components/StatusBadge';
import { Filter, ChevronDown, ChevronRight, Search, GitCompare } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

interface ExecutionRun {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'running' | 'pending';
  browser: string;
  environment: string;
  tag: string;
  duration: string;
  timestamp: string;
  passRate: number;
  tests: { total: number; passed: number; failed: number };
}

const mockRuns: ExecutionRun[] = [
  {
    id: 'RUN-1234',
    name: 'E2E Checkout Flow',
    status: 'passed',
    browser: 'Chrome',
    environment: 'Production',
    tag: 'regression',
    duration: '2m 34s',
    timestamp: '2 hours ago',
    passRate: 100,
    tests: { total: 45, passed: 45, failed: 0 }
  },
  {
    id: 'RUN-1233',
    name: 'API Integration Tests',
    status: 'failed',
    browser: 'Firefox',
    environment: 'Staging',
    tag: 'smoke',
    duration: '1m 12s',
    timestamp: '3 hours ago',
    passRate: 87.5,
    tests: { total: 24, passed: 21, failed: 3 }
  },
  {
    id: 'RUN-1232',
    name: 'User Authentication',
    status: 'running',
    browser: 'Safari',
    environment: 'Production',
    tag: 'critical',
    duration: '0m 45s',
    timestamp: '5 minutes ago',
    passRate: 95,
    tests: { total: 18, passed: 17, failed: 0 }
  },
  {
    id: 'RUN-1231',
    name: 'Dashboard Load Tests',
    status: 'passed',
    browser: 'Edge',
    environment: 'Staging',
    tag: 'regression',
    duration: '3m 21s',
    timestamp: '5 hours ago',
    passRate: 100,
    tests: { total: 56, passed: 56, failed: 0 }
  },
  {
    id: 'RUN-1230',
    name: 'Payment Processing',
    status: 'failed',
    browser: 'Chrome',
    environment: 'Production',
    tag: 'critical',
    duration: '1m 56s',
    timestamp: '6 hours ago',
    passRate: 78.9,
    tests: { total: 19, passed: 15, failed: 4 }
  },
];

interface ExecutionRunsPageProps {
  onNavigateToDetail: (runId: string) => void;
}

export function ExecutionRunsPage({ onNavigateToDetail }: ExecutionRunsPageProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [selectedRuns, setSelectedRuns] = useState<string[]>([]);

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const toggleSelection = (id: string) => {
    setSelectedRuns(prev => 
      prev.includes(id) ? prev.filter(runId => runId !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <Header title="Execution Runs" subtitle="Track and analyze your test execution history" />
      
      <div className="flex-1 overflow-auto p-8">
        {/* Filter Bar */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="size-5 text-slate-600" />
              <span className="text-sm font-medium text-slate-900">Filters:</span>
            </div>
            
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 days</SelectItem>
                <SelectItem value="month">Last 30 days</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Browser" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Browsers</SelectItem>
                <SelectItem value="chrome">Chrome</SelectItem>
                <SelectItem value="firefox">Firefox</SelectItem>
                <SelectItem value="safari">Safari</SelectItem>
                <SelectItem value="edge">Edge</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                <SelectItem value="regression">Regression</SelectItem>
                <SelectItem value="smoke">Smoke</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Environment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Environments</SelectItem>
                <SelectItem value="production">Production</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="dev">Development</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input 
                type="text" 
                placeholder="Search by name or ID..." 
                className="pl-9 bg-slate-50"
              />
            </div>
          </div>

          {selectedRuns.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-3">
              <span className="text-sm text-slate-600">{selectedRuns.length} runs selected</span>
              <Button variant="outline" size="sm" className="gap-2">
                <GitCompare className="size-4" />
                Compare Runs
              </Button>
            </div>
          )}
        </div>

        {/* Execution Runs Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider w-12">
                    <input type="checkbox" className="rounded border-slate-300" />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Run ID / Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Browser
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Environment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Tag
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Pass Rate
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-4 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {mockRuns.map((run) => (
                  <React.Fragment key={run.id}>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <input 
                          type="checkbox" 
                          className="rounded border-slate-300"
                          checked={selectedRuns.includes(run.id)}
                          onChange={() => toggleSelection(run.id)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => onNavigateToDetail(run.id)}
                          className="text-left hover:text-blue-600 transition-colors"
                        >
                          <div className="font-medium text-slate-900">{run.name}</div>
                          <div className="text-sm text-slate-500">{run.id}</div>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={run.status} />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-900">{run.browser}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          {run.environment}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {run.tag}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-900">{run.duration}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-2 w-24 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                run.passRate === 100 ? 'bg-emerald-500' :
                                run.passRate >= 90 ? 'bg-blue-500' :
                                run.passRate >= 70 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${run.passRate}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-slate-900">{run.passRate}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-500">{run.timestamp}</span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleRow(run.id)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          {expandedRow === run.id ? (
                            <ChevronDown className="size-5" />
                          ) : (
                            <ChevronRight className="size-5" />
                          )}
                        </button>
                      </td>
                    </tr>
                    
                    {expandedRow === run.id && (
                      <tr>
                        <td colSpan={10} className="px-6 py-4 bg-slate-50">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-lg border border-slate-200">
                              <div className="text-xs text-slate-600 mb-1">Total Tests</div>
                              <div className="text-2xl font-semibold text-slate-900">{run.tests.total}</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-slate-200">
                              <div className="text-xs text-slate-600 mb-1">Passed</div>
                              <div className="text-2xl font-semibold text-emerald-600">{run.tests.passed}</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-slate-200">
                              <div className="text-xs text-slate-600 mb-1">Failed</div>
                              <div className="text-2xl font-semibold text-red-600">{run.tests.failed}</div>
                            </div>
                          </div>
                          <div className="mt-4 flex gap-2">
                            <Button onClick={() => onNavigateToDetail(run.id)} size="sm">View Details</Button>
                            <Button variant="outline" size="sm">Download Report</Button>
                            <Button variant="outline" size="sm">Rerun Tests</Button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
