import React from 'react';
import { Chip } from '@mui/material';

const colors = {
  PASS: 'success',
  FAIL: 'error',
  RUNNING: 'warning',
};

export function StatusChip({ status, size = 'medium' }) {
  const normalized = status?.toUpperCase() || 'UNKNOWN';
  return <Chip label={normalized} color={colors[normalized] || 'default'} size={size} variant="filled" />;
}
