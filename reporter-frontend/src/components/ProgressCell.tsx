import React from 'react';
import { Box, LinearProgress } from '@mui/material';

interface ProgressCellProps {
  value: number; // 0-100
}

export function ProgressCell({ value }: ProgressCellProps) {
  const getColor = () => {
    if (value >= 95) return '#10B981'; // emerald
    if (value >= 80) return '#F59E0B'; // amber
    return '#EF4444'; // red
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        width: '100%'
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <LinearProgress
          variant="determinate"
          value={value}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: '#E5E7EB',
            '& .MuiLinearProgress-bar': {
              borderRadius: 3,
              backgroundColor: getColor(),
              transition: 'all 0.3s ease'
            }
          }}
        />
      </Box>
      <Box
        sx={{
          minWidth: 48,
          textAlign: 'right',
          fontSize: 14,
          fontWeight: 700,
          color: '#111827'
        }}
      >
        {value}%
      </Box>
    </Box>
  );
}
