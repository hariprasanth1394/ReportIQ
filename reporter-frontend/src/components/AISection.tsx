import React from 'react';
import { Box, Card, Typography, Stack } from '@mui/material';
import { Lightbulb } from 'lucide-react';

interface AISectionProps {
  summary: string;
  recommendations?: string[];
}

export function AISection({ summary, recommendations = [] }: AISectionProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px', mt: '32px' }}>
      {/* Summary Card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '20px',
          padding: '24px',
          backgroundColor: '#F9FAFB',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
          },
        }}
      >
        {/* Header */}
        <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: '16px' }}>
          <Box
            sx={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Lightbulb size={20} color="#FFFFFF" />
          </Box>
          <Typography
            sx={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#111827',
              mt: '4px',
            }}
          >
            Execution Insights
          </Typography>
        </Stack>

        {/* Summary Text */}
        <Typography
          sx={{
            fontSize: '14px',
            lineHeight: '1.6',
            color: '#374151',
            maxWidth: '800px',
            mb: recommendations.length > 0 ? '20px' : '0',
          }}
        >
          {summary}
        </Typography>

        {/* Recommended Actions */}
        {recommendations.length > 0 && (
          <Card
            elevation={0}
            sx={{
              borderRadius: '14px',
              padding: '16px',
              backgroundColor: '#FFFBEB',
              border: '1px solid rgba(217, 119, 6, 0.15)',
              mt: '16px',
            }}
          >
            <Typography
              sx={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#92400E',
                mb: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Recommended Actions
            </Typography>
            <Stack spacing={1}>
              {recommendations.map((rec, idx) => (
                <Box key={idx} sx={{ display: 'flex', gap: '8px' }}>
                  <Typography
                    sx={{
                      fontSize: '13px',
                      color: '#78350F',
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    •
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '13px',
                      color: '#78350F',
                      lineHeight: '1.5',
                    }}
                  >
                    {rec}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Card>
        )}
      </Card>
    </Box>
  );
}
