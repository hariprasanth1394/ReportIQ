import React from 'react';
import { Bell, Search } from 'lucide-react';

export function Topbar({ title, subtitle }) {
  return (
    <header className="bg-white border-b border-slate-200 px-8 py-5 flex-shrink-0 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Title Section */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
        </div>
        
        {/* Actions Section */}
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2.5 w-72 bg-slate-50 border border-slate-200 rounded-2xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          
          {/* Notifications Bell */}
          <button className="relative p-2.5 hover:bg-slate-100 rounded-2xl transition-colors group">
            <Bell className="w-5 h-5 text-slate-600 group-hover:text-slate-900" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
