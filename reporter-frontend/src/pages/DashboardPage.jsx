import React, { useEffect, useState } from 'react';
import { Paper, Typography, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Box, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { StatusChip } from '../ui/StatusChip.jsx';

export default function DashboardPage() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get('/api/executions/runs');
        if (mounted) setRuns(res.data || []);
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
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="h5">Test Execution Runs</Typography>
        <Chip label={`${runs.length} total`} size="small" color="primary" variant="outlined" />
      </Stack>
      <TableContainer component={Paper} elevation={0}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8fafc' }}>
              <TableCell><strong>Browser</strong></TableCell>
              <TableCell><strong>Tags</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Test Cases</strong></TableCell>
              <TableCell><strong>Pass / Fail</strong></TableCell>
              <TableCell><strong>Started</strong></TableCell>
              <TableCell><strong>Finished</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {runs.map((row) => (
              <TableRow
                key={row.id}
                hover
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f1f5f9' } }}
                onClick={() => navigate(`/runs/${row.id}`)}
              >
                <TableCell><Chip label={row.browser} size="small" /></TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                    {row.tags && row.tags.length > 0 ? (
                      row.tags.map((tag, idx) => (
                        <Chip key={idx} label={tag} size="small" variant="outlined" color="primary" />
                      ))
                    ) : (
                      <Typography variant="caption" color="text.secondary">-</Typography>
                    )}
                  </Stack>
                </TableCell>
                <TableCell><StatusChip status={row.status} /></TableCell>
                <TableCell>{row.testCaseCount}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label={`✓ ${row.passCount}`} size="small" color="success" variant="outlined" />
                    {row.failCount > 0 && <Chip label={`✗ ${row.failCount}`} size="small" color="error" variant="outlined" />}
                  </Stack>
                </TableCell>
                <TableCell sx={{ fontSize: '0.85rem' }}>{row.startedAt ? new Date(row.startedAt).toLocaleString() : '-'}</TableCell>
                <TableCell sx={{ fontSize: '0.85rem' }}>{row.finishedAt ? new Date(row.finishedAt).toLocaleString() : '-'}</TableCell>
              </TableRow>
            ))}
            {runs.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: '#9ca3af' }}>
                  No execution runs yet. Run your tests to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
