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
          bg: 'bg-emerald-100',
          text: 'text-emerald-700',
          icon: CheckCircle2,
          label: 'Passed'
        };
      case 'failed':
        return {
          bg: 'bg-red-100',
          text: 'text-red-700',
          icon: XCircle,
          label: 'Failed'
        };
      case 'running':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-700',
          icon: Loader2,
          label: 'Running'
        };
      case 'pending':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          icon: Clock,
          label: 'Pending'
        };
      case 'skipped':
        return {
          bg: 'bg-amber-100',
          text: 'text-amber-700',
          icon: Pause,
          label: 'Skipped'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  const iconSizes = {
    sm: 'size-3',
    md: 'size-3.5',
    lg: 'size-4'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${sizeClasses[size]} ${config.bg} ${config.text} rounded-md font-medium`}
    >
      <Icon className={`${iconSizes[size]} ${status === 'running' ? 'animate-spin' : ''}`} />
      <span>{config.label}</span>
    </span>
  );
}
