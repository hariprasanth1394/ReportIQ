import React from 'react';
import { Bell, Search } from 'lucide-react';
import { Input } from './ui/input';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl leading-tight font-semibold text-slate-900">{title}</h1>
          {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search..."
              className="pl-9 h-10 w-52 bg-slate-50 border-slate-200 rounded-xl"
            />
          </div>
          
          <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell className="size-5 text-slate-600" />
            <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
