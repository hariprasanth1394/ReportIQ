import React from 'react';
import { CheckCircle2, XCircle, Clock, Loader2, Pause } from 'lucide-react';

export type Status = 'passed' | 'failed' | 'running' | 'pending' | 'skipped';

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'passed':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          icon: CheckCircle2,
          label: 'Passed'
        };
      case 'failed':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200',
          icon: XCircle,
          label: 'Failed'
        };
      case 'running':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
          icon: Loader2,
          label: 'Running'
        };
      case 'pending':
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          border: 'border-gray-200',
          icon: Clock,
          label: 'Pending'
        };
      case 'skipped':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-200',
          icon: Pause,
          label: 'Skipped'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  const iconSizes = {
    sm: 'size-3',
    md: 'size-3.5',
    lg: 'size-4'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${sizeClasses[size]} ${config.bg} ${config.text} border ${config.border} rounded-full`}
    >
      <Icon className={`${iconSizes[size]} ${status === 'running' ? 'animate-spin' : ''}`} />
      <span>{config.label}</span>
    </span>
  );
}
