import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { Paper, Typography, Stack, Chip, Divider, Box, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';
import { StatusChip } from '../ui/StatusChip.jsx';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function ExecutionDetailPage() {
  const { runId } = useParams();
  const navigate = useNavigate();
  const [run, setRun] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get(`/api/executions/runs/${runId}`);
        if (mounted) setRun(res.data);
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
  }, [runId]);

  if (loading || !run) {
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
          onClick={() => navigate('/')}
          sx={{ textTransform: 'none' }}
        >
          Back to Dashboard
        </Button>
      </Stack>

      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="h5">Execution Run</Typography>
        <Chip label={run.browser} size="small" />
        <StatusChip status={run.status} />
      </Stack>

      <Typography variant="body2" color="text.secondary">
        Started {run.startedAt ? new Date(run.startedAt).toLocaleString() : '-'}
        {run.finishedAt ? ` • Finished ${new Date(run.finishedAt).toLocaleString()}` : ' • Running'}
      </Typography>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Test Cases ({run.testCases.length})
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell><strong>Test Case</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Steps</strong></TableCell>
                <TableCell><strong>Started</strong></TableCell>
                <TableCell><strong>Finished</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {run.testCases.map((tc) => (
                <TableRow
                  key={tc.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/runs/${runId}/test-cases/${tc.id}`)}
                >
                  <TableCell sx={{ fontWeight: 500 }}>{tc.name}</TableCell>
                  <TableCell><StatusChip status={tc.status} size="small" /></TableCell>
                  <TableCell>{tc.steps.length}</TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>{new Date(tc.startedAt).toLocaleTimeString()}</TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>{tc.finishedAt ? new Date(tc.finishedAt).toLocaleTimeString() : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Stack>
  );
}
