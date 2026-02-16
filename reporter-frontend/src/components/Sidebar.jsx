import React from 'react';
import { LayoutDashboard, PlayCircle, Users, Settings, Activity, LogOut } from 'lucide-react';

export function Sidebar({ currentPage, onNavigate }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'executions', label: 'Execution Runs', icon: PlayCircle },
    { id: 'analytics', label: 'Analytics', icon: Activity },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
            <Activity className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">ReportIQ</h1>
            <p className="text-xs text-slate-500">Test Analytics</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={2} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile + Logout */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">John Doe</p>
            <p className="text-xs text-slate-500 truncate">john@company.com</p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="w-5 h-5" strokeWidth={2} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
