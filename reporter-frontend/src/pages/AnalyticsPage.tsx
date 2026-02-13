import React from 'react';
import { Header } from '../components/Header';
import { BarChart3, TrendingUp, Activity, Clock } from 'lucide-react';

export function AnalyticsPage() {
  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <Header title="Analytics" subtitle="Deep dive into your test automation metrics" />
      
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-12 border border-slate-200 shadow-sm text-center">
            <div className="bg-blue-50 size-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="size-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">Advanced Analytics</h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Comprehensive analytics and reporting tools are coming soon. Track trends, identify patterns, and optimize your testing strategy.
            </p>
            
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="bg-slate-50 rounded-lg p-6">
                <TrendingUp className="size-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-medium text-slate-900 mb-1">Trend Analysis</h3>
                <p className="text-sm text-slate-600">Historical performance tracking</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-6">
                <Activity className="size-8 text-emerald-600 mx-auto mb-3" />
                <h3 className="font-medium text-slate-900 mb-1">Performance Metrics</h3>
                <p className="text-sm text-slate-600">Detailed execution insights</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-6">
                <Clock className="size-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-medium text-slate-900 mb-1">Time Tracking</h3>
                <p className="text-sm text-slate-600">Duration and efficiency analysis</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
