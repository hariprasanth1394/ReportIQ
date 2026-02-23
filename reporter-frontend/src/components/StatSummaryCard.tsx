import React from 'react';
import { Box, Typography, Card } from '@mui/material';
import { css } from '@emotion/react';

interface StatSummaryCardProps {
  label: string;
  value: string | number;
  unit?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
}

const variantStyles = {
  default: {
    bgTint: '#F0F9FF',
    borderColor: 'rgba(30, 64, 175, 0.1)',
    textColor: '#1E40AF',
    accentColor: '#2563EB',
  },
  success: {
    bgTint: '#F0FDF4',
    borderColor: 'rgba(16, 185, 129, 0.1)',
    textColor: '#059669',
    accentColor: '#10B981',
  },
  error: {
    bgTint: '#FEF2F2',
    borderColor: 'rgba(239, 68, 68, 0.1)',
    textColor: '#DC2626',
    accentColor: '#EF4444',
  },
  warning: {
    bgTint: '#FFFBEB',
    borderColor: 'rgba(217, 119, 6, 0.1)',
    textColor: '#B45309',
    accentColor: '#F59E0B',
  },
  info: {
    bgTint: '#F8FAFC',
    borderColor: 'rgba(100, 116, 139, 0.15)',
    textColor: '#475569',
    accentColor: '#64748B',
  },
};

export function StatSummaryCard({
  label,
  value,
  unit,
  variant = 'default',
}: StatSummaryCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card
      elevation={0}
      sx={{
        height: '90px',
        borderRadius: '16px',
        padding: '20px',
        backgroundColor: styles.bgTint,
        border: `1px solid ${styles.borderColor}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: `rgba(${styles.accentColor}, 0.3)`,
          boxShadow: `0 4px 12px ${styles.borderColor}`,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: styles.textColor,
          fontWeight: 600,
          fontSize: '12px',
          opacity: 0.8,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
        <Typography
          sx={{
            fontSize: '28px',
            fontWeight: 600,
            color: styles.accentColor,
            lineHeight: 1,
          }}
        >
          {value}
        </Typography>
        {unit && (
          <Typography
            sx={{
              fontSize: '13px',
              fontWeight: 500,
              color: styles.textColor,
              opacity: 0.7,
            }}
          >
            {unit}
          </Typography>
        )}
      </Box>
    </Card>
  );
}
