import React from 'react';
import { Box, Chip, Card, useTheme, useMediaQuery, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { StatusPill } from './StatusPill';
import { ProgressCell } from './ProgressCell';
import { formatDate, formatRelativeTime } from '../utils/dateUtils';
import { computeDuration, NormalizedExecutionRun } from '../utils/dataMapper';

interface StyledExecutionTableProps {
  rows: NormalizedExecutionRun[];
  loading?: boolean;
  onRowClick?: (runId: string) => void;
}

export function StyledExecutionTable({ 
  rows, 
  loading = false,
  onRowClick 
}: StyledExecutionTableProps) {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('md'));

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Run Name',
      flex: 2,
      minWidth: 240,
      sortable: false,
      filterable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
            overflow: 'visible',
            padding: '12px 16px',
          }}
        >
          <Typography
            sx={{
              fontSize: 15,
              fontWeight: 600,
              color: '#111827',
              cursor: 'pointer',
              textAlign: 'center',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              maxWidth: '100%',
              overflow: 'visible',
              '&:hover': {
                color: '#2563EB',
              },
            }}
            onClick={() => onRowClick?.(params.row.id)}
          >
            {params.row.name}
          </Typography>
          <Box
            sx={{
              fontSize: 12,
              color: '#9CA3AF',
              fontFamily: 'monospace',
              letterSpacing: '0.5px',
              whiteSpace: 'normal',
              wordBreak: 'break-all',
              maxWidth: '100%',
            }}
          >
            {params.row.id.slice(-8).toUpperCase()}
          </Box>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 100,
      sortable: false,
      filterable: false,
      align: 'center',
      headerAlign: 'center',
      displayCell: true,
      renderCell: (params: GridRenderCellParams) => (
        <StatusPill status={params.row.status} />
      ),
    },
    {
      field: 'browser',
      headerName: 'Browser',
      flex: 1,
      minWidth: 100,
      sortable: false,
      filterable: false,
      align: 'left',
      headerAlign: 'left',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>
          {params.row.browser || '-'}
        </Box>
      ),
    },
    {
      field: 'environment',
      headerName: 'Environment',
      flex: 1,
      minWidth: 110,
      sortable: false,
      filterable: false,
      align: 'left',
      headerAlign: 'left',
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.row.environment || '-'}
          size="small"
          sx={{
            backgroundColor: '#F3F4F6',
            color: '#374151',
            fontSize: 12,
            fontWeight: 600,
            borderRadius: '12px',
            border: 'none',
            height: '28px',
          }}
        />
      ),
    },
    {
      field: 'tag',
      headerName: 'Tag',
      flex: 1,
      minWidth: 90,
      sortable: false,
      filterable: false,
      align: 'left',
      headerAlign: 'left',
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.row.tag || '-'}
          size="small"
          sx={{
            backgroundColor: '#EFF6FF',
            color: '#1E40AF',
            fontSize: 12,
            fontWeight: 600,
            borderRadius: '12px',
            border: 'none',
            height: '28px',
          }}
        />
      ),
    },
    {
      field: 'duration',
      headerName: 'Duration',
      flex: 1,
      minWidth: 100,
      sortable: false,
      filterable: false,
      align: 'center',
      headerAlign: 'center',
      // CRITICAL: Use valueGetter to compute duration from raw timestamps
      // Never rely on pre-formatted values - compute on every render
      valueGetter: (value, row) => {
        return computeDuration(row.startedAt, row.finishedAt);
      },
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'passRate',
      headerName: 'Pass Rate',
      flex: 1.2,
      minWidth: 140,
      sortable: false,
      filterable: false,
      align: 'left',
      headerAlign: 'left',
      renderCell: (params: GridRenderCellParams) => (
        <ProgressCell value={params.row.passRate || 0} />
      ),
    },
    {
      field: 'startedAt',
      headerName: 'Started',
      flex: 1.3,
      minWidth: 160,
      sortable: false,
      filterable: false,
      align: 'right',
      headerAlign: 'right',
      // CRITICAL: Use valueGetter to compute from raw timestamp
      valueGetter: (value, row) => {
        return formatDate(row.startedAt);
      },
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'finishedAt',
      headerName: 'Finished',
      flex: 1.3,
      minWidth: 160,
      sortable: false,
      filterable: false,
      align: 'right',
      headerAlign: 'right',
      // CRITICAL: Use valueGetter to compute from raw timestamp
      valueGetter: (value, row) => {
        return formatDate(row.finishedAt);
      },
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>
          {params.value}
        </Box>
      ),
    },
  ];

  return (
    <Card
      sx={{
        width: '100%',
        borderRadius: '16px',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        boxShadow: 'none',
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        p: 0,
      }}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          '& .MuiDataGrid-root': {
            border: 'none',
            backgroundColor: '#FFFFFF',
            borderRadius: 0,
            width: '100%',
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
              paddingX: 3,
              paddingY: 2,
              fontSize: 14,
              color: '#111827',
              display: 'flex',
              alignItems: 'center',
              '&:focus': {
                outline: 'none',
              },
              '&:focus-within': {
                outline: 'none',
              },
            },
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: '#FAFAFA',
              borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
              fontSize: 12,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: '#6B7280',
              paddingX: 3,
              paddingY: 2,
              height: 56,
              display: 'flex',
              alignItems: 'center',
              '&:focus': {
                outline: 'none',
              },
              '&:focus-within': {
                outline: 'none',
              },
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 600,
            },
            '& .MuiDataGrid-row': {
              height: 64,
              '&:hover': {
                backgroundColor: '#F9FAFB',
                transition: 'all 0.2s ease',
              },
              '&.Mui-selected': {
                backgroundColor: 'transparent !important',
                '&:hover': {
                  backgroundColor: '#F9FAFB !important',
                },
              },
            },
            '& .MuiDataGrid-columnSeparator': {
              display: 'none',
            },
            '& .MuiDataGrid-menuIcon': {
              display: 'none',
            },
            '& .MuiDataGrid-sortIcon': {
              opacity: 0,
            },
            '& .MuiDataGrid-footerContainer': {
              display: 'none',
            },
            '& .MuiDataGrid-virtualScroller': {
              '&::-webkit-scrollbar': {
                width: '8px',
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#D1D5DB',
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: '#9CA3AF',
                },
              },
            },
          },
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          rowHeight={64}
          headerHeight={56}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          hideFooter={true}
          slotProps={{
            loadingOverlay: {
              variant: 'skeleton',
              noRowsVariant: 'skeleton',
            },
          }}
          sx={{
            width: '100%',
            '& .MuiDataGrid-root': {
              borderRadius: 0,
            },
          }}
        />
      </Box>
    </Card>
  );
}
