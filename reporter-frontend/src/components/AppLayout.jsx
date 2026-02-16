import React from 'react';
import { Sidebar } from './Sidebar.jsx';

export function AppLayout({ children, currentPage, onNavigate }) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
