import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { Paper, Typography, Stack, Chip, Divider, Box, CircularProgress, Button, Grid, Card, CardContent, alpha } from '@mui/material';
import { StatusChip } from '../ui/StatusChip.jsx';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function TestCaseDetailPage() {
  const { runId, testCaseId } = useParams();
  const navigate = useNavigate();
  const [testCase, setTestCase] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get(`/api/executions/runs/${runId}/test-cases/${testCaseId}`);
        if (mounted) setTestCase(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    const timer = setInterval(load, 4000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [runId, testCaseId]);

  if (loading || !testCase) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Stack direction="row" spacing={2} alignItems="center">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/runs/${runId}`)}
          variant="outlined"
          sx={{ 
            textTransform: 'none',
            borderRadius: 2,
            fontWeight: 500,
          }}
        >
          Back to Execution
        </Button>
      </Stack>

      <Box>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600, 
              color: '#111827',
            }}
          >
            {testCase.name}
          </Typography>
          <StatusChip status={testCase.status} />
        </Stack>

        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem' }}>
          Started {testCase.startedAt ? new Date(testCase.startedAt).toLocaleString() : '-'}
          {testCase.finishedAt ? ` • Finished ${new Date(testCase.finishedAt).toLocaleString()}` : ' • Running'}
        </Typography>
      </Box>

      {/* Error Section */}
      {testCase.error && (
        <Card 
          elevation={0}
          sx={{ 
            borderRadius: 4,
            border: '1px solid',
            borderColor: alpha('#ef4444', 0.3),
            bgcolor: alpha('#ef4444', 0.05),
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                color: '#dc2626',
                fontWeight: 600,
                mb: 1.5,
              }}
            >
              Error Details
            </Typography>
            <Typography 
              variant="body2" 
              component="pre" 
              sx={{ 
                fontFamily: 'monospace', 
                fontSize: '0.8125rem', 
                overflow: 'auto',
                color: '#991b1b',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {testCase.error}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Execution Steps */}
      <Card 
        elevation={0}
        sx={{ 
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'white',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 3, 
              fontWeight: 600,
              color: '#111827',
              fontSize: '1.125rem',
            }}
          >
            Execution Steps
            <Typography 
              component="span" 
              sx={{ 
                ml: 1, 
                color: '#64748b', 
                fontWeight: 500,
                fontSize: '0.95rem',
              }}
            >
              ({testCase.steps.length})
            </Typography>
          </Typography>

          <Stack spacing={2}>
            {testCase.steps.map((step, idx) => (
              <Card 
                key={step.id} 
                elevation={0}
                sx={{ 
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: '#F8FAFC',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Grid container spacing={2} alignItems="flex-start">
                    <Grid item xs={12} md={step.screenshot ? 7 : 12}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                        <Chip 
                          label={`Step ${idx + 1}`} 
                          size="small"
                          sx={{
                            bgcolor: alpha('#2563eb', 0.1),
                            color: '#2563eb',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            height: 24,
                          }}
                        />
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: 600,
                            color: '#111827',
                          }}
                        >
                          {step.stepName}
                        </Typography>
                        <StatusChip status={step.status} />
                      </Stack>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: '#64748b',
                          display: 'block',
                          mb: step.error ? 1 : 0,
                        }}
                      >
                        {new Date(step.timestamp).toLocaleTimeString()}
                      </Typography>
                      {step.error && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            mt: 1.5,
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: alpha('#ef4444', 0.05),
                            border: '1px solid',
                            borderColor: alpha('#ef4444', 0.2),
                            fontFamily: 'monospace', 
                            fontSize: '0.8125rem',
                            color: '#dc2626',
                          }}
                        >
                          {step.error.split('\n')[0]}
                        </Typography>
                      )}
                    </Grid>
                    {step.screenshot && (
                      <Grid item xs={12} md={5}>
                        <Box
                          component="img"
                          src={`data:image/png;base64,${step.screenshot}`}
                          alt={`screenshot-${step.id}`}
                          sx={{ 
                            width: '100%', 
                            borderRadius: 3, 
                            border: '1px solid',
                            borderColor: 'divider',
                            maxHeight: 300, 
                            objectFit: 'contain',
                            bgcolor: 'white',
                          }}
                        />
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            ))}
            {testCase.steps.length === 0 && (
              <Typography 
                sx={{ 
                  color: '#9ca3af',
                  textAlign: 'center',
                  py: 4,
                }}
              >
                No steps recorded yet.
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
