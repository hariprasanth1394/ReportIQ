import React from 'react';
import { Header } from '../components/Header';
import { Settings as SettingsIcon, Bell, Shield, Database, Zap } from 'lucide-react';

export function SettingsPage() {
  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <Header title="Settings" subtitle="Configure your workspace preferences" />
      
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-12 border border-slate-200 shadow-sm text-center">
            <div className="bg-slate-50 size-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <SettingsIcon className="size-10 text-slate-600" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">Settings & Configuration</h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Customize your workspace, manage integrations, and configure notification preferences.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-slate-50 rounded-lg p-6 text-left">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Bell className="size-5 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-slate-900">Notifications</h3>
                </div>
                <p className="text-sm text-slate-600">Configure alerts and email notifications</p>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-6 text-left">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <Shield className="size-5 text-emerald-600" />
                  </div>
                  <h3 className="font-medium text-slate-900">Security</h3>
                </div>
                <p className="text-sm text-slate-600">Manage authentication and access control</p>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-6 text-left">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Database className="size-5 text-purple-600" />
                  </div>
                  <h3 className="font-medium text-slate-900">Integrations</h3>
                </div>
                <p className="text-sm text-slate-600">Connect with CI/CD and other tools</p>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-6 text-left">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <Zap className="size-5 text-orange-600" />
                  </div>
                  <h3 className="font-medium text-slate-900">API Keys</h3>
                </div>
                <p className="text-sm text-slate-600">Manage API access and webhooks</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
