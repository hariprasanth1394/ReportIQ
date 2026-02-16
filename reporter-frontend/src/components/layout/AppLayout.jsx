import React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export default function AppLayout({ children, currentPage, onNavigate, title, subtitle }) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Fixed Sidebar */}
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <Topbar title={title} subtitle={subtitle} />
        
        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
