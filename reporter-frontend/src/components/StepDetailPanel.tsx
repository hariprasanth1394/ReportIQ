import React, { useState } from 'react';
import { Box, Card, Stack, Typography, Tabs, Tab } from '@mui/material';
import { ScreenshotViewer } from './ScreenshotViewer';

interface StepDetailPanelProps {
  stepName?: string;
  stepStatus?: 'PASS' | 'FAIL';
  stepDuration?: number;
  screenshot?: string;
  error?: string;
}

export function StepDetailPanel({
  stepName = 'Step Name',
  stepStatus = 'PASS',
  stepDuration = 0,
  screenshot,
  error,
}: StepDetailPanelProps) {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '18px',
        padding: '20px',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        backgroundColor: '#FFFFFF',
        height: 'fit-content',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: '16px' }}>
        <Box>
          <Typography
            sx={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#111827',
              mb: '4px',
            }}
          >
            {stepName}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', mt: '8px' }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '6px',
                backgroundColor:
                  stepStatus === 'PASS'
                    ? 'rgba(16, 185, 129, 0.1)'
                    : 'rgba(239, 68, 68, 0.1)',
              }}
            >
              <Box
                sx={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor:
                    stepStatus === 'PASS' ? '#10B981' : '#EF4444',
                }}
              />
              <Typography
                sx={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: stepStatus === 'PASS' ? '#059669' : '#DC2626',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px',
                }}
              >
                {stepStatus === 'PASS' ? 'Passed' : 'Failed'}
              </Typography>
            </Box>
            {stepDuration !== undefined && (
              <Typography
                sx={{
                  fontSize: '12px',
                  color: '#6B7280',
                  fontWeight: 500,
                }}
              >
                Duration: {stepDuration}s
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Tab Navigation */}
      <Box sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.08)', mb: '16px' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              fontSize: '14px',
              fontWeight: 500,
              color: '#6B7280',
              textTransform: 'none',
              padding: '12px 16px',
              minHeight: 'auto',
              '&.Mui-selected': {
                color: '#2563EB',
                fontWeight: 600,
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#2563EB',
              height: '2px',
            },
          }}
        >
          <Tab label="Screenshot" />
          {error && <Tab label="Error Details" />}
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ mt: '16px' }}>
        {tabValue === 0 && (
          <ScreenshotViewer screenshotUrl={screenshot} maxHeight={420} borderRadius={16} />
        )}

        {tabValue === 1 && error && (
          <Box
            sx={{
              borderRadius: '12px',
              padding: '16px',
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}
          >
            <Typography
              sx={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#DC2626',
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
                mb: '8px',
              }}
            >
              Error Message
            </Typography>
            <Typography
              sx={{
                fontSize: '13px',
                color: '#7F1D1D',
                lineHeight: '1.6',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {error}
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
}
