import React, { useState } from 'react';
import { Header } from '../components/Header';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ArrowLeft, CheckCircle2, XCircle, Clock, Image, Terminal, Sparkles, AlertTriangle } from 'lucide-react';

interface ExecutionDetailPageProps {
  runId: string;
  onBack: () => void;
}

const mockSteps = [
  { id: 1, name: 'Navigate to Login Page', status: 'passed', duration: '1.2s', screenshot: true },
  { id: 2, name: 'Enter Credentials', status: 'passed', duration: '0.8s', screenshot: true },
  { id: 3, name: 'Click Login Button', status: 'passed', duration: '0.5s', screenshot: false },
  { id: 4, name: 'Verify Dashboard Load', status: 'failed', duration: '3.2s', screenshot: true },
  { id: 5, name: 'Check User Profile', status: 'pending', duration: '-', screenshot: false },
];

const mockLogs = [
  { timestamp: '10:23:45.123', level: 'info', message: 'Test execution started' },
  { timestamp: '10:23:46.341', level: 'info', message: 'Browser launched: Chrome 119' },
  { timestamp: '10:23:47.567', level: 'info', message: 'Navigated to https://app.example.com/login' },
  { timestamp: '10:23:48.789', level: 'info', message: 'Element found: input[name="email"]' },
  { timestamp: '10:23:49.012', level: 'info', message: 'Credentials entered successfully' },
  { timestamp: '10:23:49.234', level: 'warn', message: 'Slow network detected: 2.3s response time' },
  { timestamp: '10:23:52.456', level: 'error', message: 'Element not found: .dashboard-widget' },
  { timestamp: '10:23:52.678', level: 'error', message: 'Assertion failed: Expected element to be visible' },
];

export function ExecutionDetailPage({ runId, onBack }: ExecutionDetailPageProps) {
  const [selectedStep, setSelectedStep] = useState(mockSteps[0]);

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <Header title="Execution Details" subtitle={runId} />
      
      <div className="flex-1 overflow-auto p-8">
        {/* Header with Back Button and Status */}
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack} className="mb-4 gap-2">
            <ArrowLeft className="size-4" />
            Back to Execution Runs
          </Button>
          
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">E2E Checkout Flow</h2>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span>Chrome • Production</span>
                  <span>•</span>
                  <span>Started 2 hours ago</span>
                  <span>•</span>
                  <span>Duration: 2m 34s</span>
                </div>
              </div>
              <StatusBadge status="failed" size="lg" />
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="text-xs text-slate-600 mb-1">Total Steps</div>
                <div className="text-2xl font-semibold text-slate-900">5</div>
              </div>
              <div className="bg-emerald-50 rounded-lg p-4">
                <div className="text-xs text-slate-600 mb-1">Passed</div>
                <div className="text-2xl font-semibold text-emerald-600">3</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-xs text-slate-600 mb-1">Failed</div>
                <div className="text-2xl font-semibold text-red-600">1</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-4">
                <div className="text-xs text-slate-600 mb-1">Pending</div>
                <div className="text-2xl font-semibold text-amber-600">1</div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Summary Panel */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 shadow-sm mb-6">
          <div className="flex items-start gap-4">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl">
              <Sparkles className="size-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">AI Summary & Root Cause</h3>
              <div className="bg-white rounded-lg p-4 mb-3">
                <p className="text-sm text-slate-700 leading-relaxed">
                  The test failed at step 4 "Verify Dashboard Load" due to a missing DOM element. The expected 
                  <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs mx-1">.dashboard-widget</code> 
                  was not found after a 3.2s timeout. This indicates a potential issue with the dashboard loading sequence or a recent frontend deployment.
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="size-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-slate-900 mb-1">Recommended Actions</h4>
                  <ul className="text-sm text-slate-700 space-y-1">
                    <li>• Check recent deployments to production environment</li>
                    <li>• Verify the CSS class name hasn't changed in recent commits</li>
                    <li>• Increase timeout if dashboard has legitimate slow loading</li>
                    <li>• Add explicit wait for network idle state before assertion</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content: Timeline and Details */}
        <div className="grid grid-cols-12 gap-6">
          {/* Step Sidebar */}
          <div className="col-span-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900">Test Steps</h3>
              </div>
              <div className="divide-y divide-slate-200">
                {mockSteps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => setSelectedStep(step)}
                    className={`w-full p-4 text-left hover:bg-slate-50 transition-colors ${
                      selectedStep.id === step.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {step.status === 'passed' && <CheckCircle2 className="size-5 text-emerald-500" />}
                        {step.status === 'failed' && <XCircle className="size-5 text-red-500" />}
                        {step.status === 'pending' && <Clock className="size-5 text-amber-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-medium text-slate-900">{step.name}</span>
                          <span className="text-xs text-slate-500 flex-shrink-0">{step.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500">Step {step.id}</span>
                          {step.screenshot && (
                            <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                              <Image className="size-3" />
                              Screenshot
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Details Panel */}
          <div className="col-span-8">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <Tabs defaultValue="screenshot" className="w-full">
                <div className="border-b border-slate-200 px-6">
                  <TabsList className="bg-transparent">
                    <TabsTrigger value="screenshot">Screenshot</TabsTrigger>
                    <TabsTrigger value="logs">Logs</TabsTrigger>
                    <TabsTrigger value="network">Network</TabsTrigger>
                    <TabsTrigger value="console">Console</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="screenshot" className="p-6 m-0">
                  <div className="mb-4">
                    <h4 className="font-medium text-slate-900 mb-2">{selectedStep.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <StatusBadge status={selectedStep.status} size="sm" />
                      <span>•</span>
                      <span>Duration: {selectedStep.duration}</span>
                    </div>
                  </div>
                  
                  {selectedStep.screenshot ? (
                    <div className="bg-slate-100 rounded-lg aspect-video flex items-center justify-center border border-slate-200">
                      <div className="text-center">
                        <Image className="size-12 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-600">Screenshot Preview</p>
                        <p className="text-xs text-slate-500 mt-1">Step {selectedStep.id} - {selectedStep.name}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-lg p-8 text-center border border-slate-200">
                      <p className="text-sm text-slate-600">No screenshot available for this step</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="logs" className="p-6 m-0">
                  <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-slate-100 overflow-auto max-h-[500px]">
                    {mockLogs.map((log, index) => (
                      <div key={index} className="mb-2 flex gap-4">
                        <span className="text-slate-500">{log.timestamp}</span>
                        <span className={`font-semibold ${
                          log.level === 'error' ? 'text-red-400' :
                          log.level === 'warn' ? 'text-amber-400' :
                          'text-blue-400'
                        }`}>
                          [{log.level.toUpperCase()}]
                        </span>
                        <span className="flex-1">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="network" className="p-6 m-0">
                  <div className="text-center py-12 text-slate-500">
                    <Terminal className="size-12 mx-auto mb-3 text-slate-400" />
                    <p>Network requests will be displayed here</p>
                  </div>
                </TabsContent>

                <TabsContent value="console" className="p-6 m-0">
                  <div className="text-center py-12 text-slate-500">
                    <Terminal className="size-12 mx-auto mb-3 text-slate-400" />
                    <p>Console output will be displayed here</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
