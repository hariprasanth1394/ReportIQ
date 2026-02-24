import React, { useMemo, useState, useEffect } from 'react';
import { PageHeader } from '../components/PageHeader';
import { FilterToolbar } from '../components/FilterToolbar';
import { StyledExecutionTable } from '../components/StyledExecutionTable';
import { GitCompare } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Box, CircularProgress } from '@mui/material';
import { api } from '../api/client';
import { normalizeRunList, NormalizedExecutionRun } from '../utils/dataMapper';
import { usePolling } from '../hooks/usePolling';

type ExecutionRun = NormalizedExecutionRun;

interface ExecutionRunsPageProps {
  onNavigateToDetail: (runId: string) => void;
}

export function ExecutionRunsPage({ onNavigateToDetail }: ExecutionRunsPageProps) {
  const [selectedRuns, setSelectedRuns] = useState<string[]>([]);
  const [runs, setRuns] = useState<ExecutionRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    browser: 'all',
    status: 'all',
    tag: 'all',
    environment: 'all',
    search: ''
  });

  // Fetch execution runs from backend API
  const fetchRuns = async () => {
    try {
      const response = await api.get('/api/executions/runs');
      
      // STEP 1: LOG ACTUAL API RESPONSE - Verify exact field names and structure
      console.log('=== RUN API RESPONSE ===');
      console.log('Total runs:', response.data?.length);
      if (response.data && response.data.length > 0) {
        console.log('First run RAW data:', response.data[0]);
        console.log('Field names:', Object.keys(response.data[0]));
        console.log('startedAt type:', typeof response.data[0].startedAt, '=', response.data[0].startedAt);
        console.log('finishedAt type:', typeof response.data[0].finishedAt, '=', response.data[0].finishedAt);
        console.log('createdAt type:', typeof response.data[0].createdAt, '=', response.data[0].createdAt);
      }
      
      // NORMALIZE all data through dataMapper layer BEFORE rendering
      // This ensures all fields exist and are properly typed
      const normalizedRuns: ExecutionRun[] = normalizeRunList(response.data || []);
      
      // STEP 7: LOG NORMALIZED DATA - Verify startedAt is populated
      console.log('=== NORMALIZED RUNS ===');
      if (normalizedRuns.length > 0) {
        console.log('First normalized run:', normalizedRuns[0]);
        console.log('startedAt:', normalizedRuns[0].startedAt);
        console.log('finishedAt:', normalizedRuns[0].finishedAt);
      }
      
      setRuns(normalizedRuns);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch execution runs:', err);
      setError('Failed to load execution runs');
      setRuns([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load - do NOT use polling for this, handle separately
  useEffect(() => {
    fetchRuns();
  }, []);

  // Polling - uses custom hook to prevent flickering
  // Only polls after initial load, no state resets on poll
  usePolling(fetchRuns, {
    enabled: true,
    interval: 30000, // 30 seconds as requested
  });

  const toggleSelection = (id: string) => {
    setSelectedRuns(prev => 
      prev.includes(id) ? prev.filter(runId => runId !== id) : [...prev, id]
    );
  };

  const filteredRuns = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return runs.filter((run) => {
      const matchesSearch =
        !search ||
        run.name.toLowerCase().includes(search) ||
        run.id.toLowerCase().includes(search);
      const matchesStatus = filters.status === 'all' || run.status === filters.status;
      const matchesBrowser = filters.browser === 'all' || run.browser.toLowerCase() === filters.browser;
      const matchesTag = filters.tag === 'all' || run.tag === filters.tag;
      const matchesEnvironment =
        filters.environment === 'all' || run.environment.toLowerCase() === filters.environment;

      return matchesSearch && matchesStatus && matchesBrowser && matchesTag && matchesEnvironment;
    });
  }, [filters, runs]);

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#F3F4F6',
        overflow: 'hidden'
      }}
    >
      {/* Page Header */}
      <PageHeader
        title="Execution Runs"
        subtitle="Track and analyze your test execution history"
      />

      {/* Main Content - Full Width Container */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          width: '100%'
        }}
      >
        {/* Content Wrapper with Max Width - SaaS grade 1600px */}
        <Box
          sx={{
            maxWidth: '1600px',
            mx: 'auto',
            px: 4,
            py: 3,
            width: '100%'
          }}
        >
          {/* Filter Toolbar - Full Width */}
          <Box sx={{ mb: 3 }}>
            <FilterToolbar
              filters={filters}
              onFilterChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
              onSearchChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
            />
          </Box>

          {/* Selection Info Bar */}
          {selectedRuns.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                mb: 3,
                pb: 2,
                borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
              }}
            >
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  px: '12px',
                  py: '8px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #DBEAFE',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#1E40AF'
                }}
              >
                {selectedRuns.length} {selectedRuns.length === 1 ? 'run' : 'runs'} selected
              </Box>
              <Button variant="outline" size="sm" className="gap-2 h-9 hover:bg-white transition-all">
                <GitCompare size={16} />
                Compare Runs
              </Button>
            </Box>
          )}

          {/* Execution Runs Table - Full Width */}
          {loading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '400px'
              }}
            >
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '400px',
                color: '#EF4444',
                fontSize: '16px'
              }}
            >
              {error}
            </Box>
          ) : filteredRuns.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '400px',
                color: '#6B7280',
                fontSize: '16px'
              }}
            >
              No execution runs found
            </Box>
          ) : (
            <Box sx={{ width: '100%' }}>
              <StyledExecutionTable
                rows={filteredRuns}
                onRowClick={(runId) => onNavigateToDetail(runId)}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
