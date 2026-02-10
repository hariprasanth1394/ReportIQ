import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { Paper, Typography, Stack, Chip, Divider, Box, CircularProgress, Button, Grid } from '@mui/material';
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
      <Stack direction="row" spacing={2} alignItems="center">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/runs/${runId}`)}
          sx={{ textTransform: 'none' }}
        >
          Back to Execution
        </Button>
      </Stack>

      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="h5">{testCase.name}</Typography>
        <StatusChip status={testCase.status} />
      </Stack>

      <Typography variant="body2" color="text.secondary">
        Started {testCase.startedAt ? new Date(testCase.startedAt).toLocaleString() : '-'}
        {testCase.finishedAt ? ` • Finished ${new Date(testCase.finishedAt).toLocaleString()}` : ' • Running'}
      </Typography>

      {testCase.error && (
        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fef2f2', borderColor: '#fecaca' }}>
          <Typography variant="subtitle2" sx={{ color: '#dc2626' }}>
            Error
          </Typography>
          <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', overflow: 'auto', mt: 1 }}>
            {testCase.error}
          </Typography>
        </Paper>
      )}

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Execution Steps ({testCase.steps.length})
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={2}>
          {testCase.steps.map((step, idx) => (
            <Paper key={step.id} variant="outlined" sx={{ p: 2, bgcolor: '#f8fafc' }}>
              <Grid container spacing={2} alignItems="flex-start">
                <Grid item xs={12} md={step.screenshot ? 7 : 12}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <Chip label={`Step ${idx + 1}`} size="small" variant="outlined" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {step.stepName}
                    </Typography>
                    <StatusChip status={step.status} size="small" />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(step.timestamp).toLocaleTimeString()}
                  </Typography>
                  {step.error && (
                    <Typography variant="body2" color="error" sx={{ mt: 1, fontFamily: 'monospace', fontSize: '0.8rem' }}>
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
                      sx={{ width: '100%', borderRadius: 1, border: '1px solid #e5e7eb', maxHeight: 300, objectFit: 'contain' }}
                    />
                  </Grid>
                )}
              </Grid>
            </Paper>
          ))}
          {testCase.steps.length === 0 && (
            <Typography color="text.secondary">No steps recorded yet.</Typography>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
