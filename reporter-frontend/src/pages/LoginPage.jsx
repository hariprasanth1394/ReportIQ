import React, { useState } from 'react';
import { Activity, Lock, Mail, AlertCircle } from 'lucide-react';
import { api } from '../api/client.js';

export function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('admin@company.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;
      onLogin(token, user);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg shadow-lg">
                <Activity className="size-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">ReportIQ</h1>
                <p className="text-xs text-slate-500 font-medium">Test Analytics Platform</p>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
            <p className="text-slate-600 text-sm">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-slate-700">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-12 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 w-4 h-4" />
                <span className="text-sm text-slate-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            Demo credentials: admin@company.com / password
          </p>
        </div>
      </div>

      {/* Right Column - Illustration */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-8 bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100">
        <div className="max-w-lg text-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-emerald-50 rounded-lg p-4 text-left border border-emerald-100">
                <div className="text-3xl font-bold text-emerald-600 mb-1">98.5%</div>
                <div className="text-xs text-slate-600 font-medium">Pass Rate</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-left border border-blue-100">
                <div className="text-3xl font-bold text-blue-600 mb-1">2,451</div>
                <div className="text-xs text-slate-600 font-medium">Total Tests</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-left border border-purple-100">
                <div className="text-3xl font-bold text-purple-600 mb-1">45s</div>
                <div className="text-xs text-slate-600 font-medium">Avg Duration</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-left border border-orange-100">
                <div className="text-3xl font-bold text-orange-600 mb-1">12</div>
                <div className="text-xs text-slate-600 font-medium">Active Runs</div>
              </div>
            </div>
            <div className="h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
              <Activity className="size-16 text-blue-600 opacity-50" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
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
