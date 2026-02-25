import React from 'react';
import { CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react';
import { Box } from '@mui/material';

export type StatusType = 'passed' | 'failed' | 'running' | 'pending';

interface StatusPillProps {
  status: StatusType;
}

const statusConfig: Record<StatusType, { bg: string; color: string; label: string; Icon: React.ComponentType<any> }> = {
  passed: {
    bg: '#ECFDF5',
    color: '#065F46',
    label: 'PASSED',
    Icon: CheckCircle2
  },
  failed: {
    bg: '#FEF2F2',
    color: '#991B1B',
    label: 'FAILED',
    Icon: XCircle
  },
  running: {
    bg: '#EFF6FF',
    color: '#1E40AF',
    label: 'Running',
    Icon: Loader2
  },
  pending: {
    bg: '#F3F4F6',
    color: '#374151',
    label: 'Pending',
    Icon: Clock
  }
};

export function StatusPill({ status }: StatusPillProps) {
  const config = statusConfig[status];
  const { Icon } = config;

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        height: '28px',
        px: '12px',
        borderRadius: '999px',
        backgroundColor: config.bg,
        color: config.color,
        fontSize: '12px',
        fontWeight: 600,
        lineHeight: 1,
        whiteSpace: 'nowrap'
      }}
    >
      <Icon size={14} style={{ flexShrink: 0, display: 'flex' }} />
      <span>{config.label}</span>
    </Box>
  );
}
