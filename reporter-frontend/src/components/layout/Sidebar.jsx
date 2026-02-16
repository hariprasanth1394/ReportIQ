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
    <div className="w-[220px] h-screen bg-gradient-to-b from-blue-600 to-blue-700 flex flex-col flex-shrink-0 shadow-xl">
      {/* Logo Header */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
            <Activity className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">ReportIQ</h1>
            <p className="text-xs text-blue-100 font-medium">Test Analytics</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={2.5} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-3 bg-white/10 rounded-xl backdrop-blur-sm mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">John Doe</p>
            <p className="text-xs text-blue-100 truncate">john@company.com</p>
          </div>
        </div>
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-blue-100 hover:bg-red-500/20 hover:text-white transition-all duration-200"
        >
          <LogOut className="w-5 h-5" strokeWidth={2} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
