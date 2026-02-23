import React from 'react';
import { Box, Card, Stack, Typography, Tabs, Tab, alpha } from '@mui/material';
import { Clock } from 'lucide-react';

interface Step {
  id: string;
  name: string;
  status: 'PASS' | 'FAIL';
  duration?: string;
  timestamp?: string;
}

interface StepListPanelProps {
  steps: Step[];
  activeStepId?: string;
  onStepSelect?: (stepId: string) => void;
}

export function StepListPanel({
  steps,
  activeStepId,
  onStepSelect,
}: StepListPanelProps) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '18px',
        padding: '16px',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        height: 'fit-content',
        backgroundColor: '#FFFFFF',
      }}
    >
      <Typography
        sx={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#111827',
          mb: '16px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        Test Steps ({steps.length})
      </Typography>

      <Stack spacing={1}>
        {steps.map((step, idx) => (
          <Box
            key={step.id}
            onClick={() => onStepSelect?.(step.id)}
            sx={{
              padding: '12px 16px',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              backgroundColor:
                activeStepId === step.id ? '#EEF2FF' : 'transparent',
              border: '1px solid',
              borderColor:
                activeStepId === step.id
                  ? 'rgba(59, 130, 246, 0.3)'
                  : 'transparent',
              minHeight: '64px',
              display: 'flex',
              alignItems: 'center',
              '&:hover': {
                backgroundColor: '#F9FAFB',
                borderColor: 'rgba(0, 0, 0, 0.06)',
              },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', width: '100%' }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '6px',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#9CA3AF',
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px',
                    }}
                  >
                    Step {idx + 1}
                  </Typography>
                  <Box
                    sx={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: step.status === 'PASS' ? '#10B981' : '#EF4444',
                      flexShrink: 0,
                    }}
                  />
                </Box>
                <Typography
                  sx={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#111827',
                    lineHeight: 1.4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {step.name}
                </Typography>
              </Box>
              {step.duration && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Clock size={12} style={{ color: '#9CA3AF' }} />
                  <Typography
                    sx={{
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#6B7280',
                    }}
                  >
                    {step.duration}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        ))}
      </Stack>
    </Card>
  );
}
