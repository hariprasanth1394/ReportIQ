import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
}

export function KPICard({ title, value, change, changeType = 'neutral', icon: Icon, iconColor = 'bg-blue-500' }: KPICardProps) {
  const changeColors = {
    positive: 'text-emerald-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-600 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-semibold text-slate-900">{value}</h3>
            {change && (
              <span className={`text-sm ${changeColors[changeType]}`}>
                {change}
              </span>
            )}
          </div>
        </div>
        <div className={`${iconColor} p-3 rounded-lg`}>
          <Icon className="size-5 text-white" />
        </div>
      </div>
    </div>
  );
}
