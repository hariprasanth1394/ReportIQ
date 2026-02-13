import React, { useState } from 'react';
import { Activity, Lock, Mail } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
                <Activity className="size-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">ReportIQ</h1>
                <p className="text-sm text-slate-500">Test Analytics Platform</p>
              </div>
            </div>
            <h2 className="text-3xl font-semibold text-slate-900 mb-2">Welcome back</h2>
            <p className="text-slate-600">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="pl-10 h-12 border-slate-300"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 h-12 border-slate-300"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-slate-300" />
                <span className="text-sm text-slate-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              Sign in
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Contact sales
            </a>
          </p>
        </div>
      </div>

      {/* Right Column - Illustration */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-8 bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100">
        <div className="max-w-lg text-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-emerald-50 rounded-lg p-4 text-left">
                <div className="text-3xl font-bold text-emerald-600 mb-1">98.5%</div>
                <div className="text-xs text-slate-600">Pass Rate</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-left">
                <div className="text-3xl font-bold text-blue-600 mb-1">2,451</div>
                <div className="text-xs text-slate-600">Total Tests</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-left">
                <div className="text-3xl font-bold text-purple-600 mb-1">45s</div>
                <div className="text-xs text-slate-600">Avg Duration</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-left">
                <div className="text-3xl font-bold text-orange-600 mb-1">12</div>
                <div className="text-xs text-slate-600">Active Runs</div>
              </div>
            </div>
            <div className="h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
              <Activity className="size-16 text-blue-600 opacity-50" />
            </div>
          </div>
          <h2 className="text-3xl font-semibold text-slate-900 mb-4">
            Powerful test analytics at your fingertips
          </h2>
          <p className="text-slate-600 text-lg">
            Track, analyze, and optimize your automation testing with real-time insights and AI-powered recommendations.
          </p>
        </div>
      </div>
    </div>
  );
}
