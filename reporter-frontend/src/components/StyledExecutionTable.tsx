import React from 'react';
import { Box, Card, Chip, CircularProgress, Link, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { StatusPill } from './StatusPill';
import { ProgressCell } from './ProgressCell';
import { formatDate, formatDuration } from '../utils/dateUtils';
import { NormalizedExecutionRun } from '../utils/dataMapper';

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
  const columns: GridColDef[] = [
    {
      field: 'runId',
      headerName: 'RUN ID',
      flex: 0.8,
      minWidth: 110,
      sortable: false,
      filterable: false,
      align: 'left',
      headerAlign: 'left',
      renderCell: (params: GridRenderCellParams) => (
        <Link
          component="button"
          underline="none"
          sx={{
            fontSize: 14,
            fontWeight: 600,
            color: '#111827',
            cursor: 'pointer',
            '&:hover': {
              color: '#2563EB',
            },
          }}
          onClick={() => onRowClick?.(params.row.id)}
        >
          {params.value}
        </Link>
      ),
    },
    {
      field: 'suiteName',
      headerName: 'SUITE NAME',
      flex: 1.5,
      minWidth: 220,
      sortable: false,
      filterable: false,
      align: 'left',
      headerAlign: 'left',
      renderCell: (params: GridRenderCellParams) => (
        <Link
          component="button"
          underline="none"
          sx={{
            fontSize: 14,
            fontWeight: 500,
            color: '#374151',
            cursor: 'pointer',
            textAlign: 'left',
            '&:hover': {
              color: '#2563EB',
            },
          }}
          onClick={() => onRowClick?.(params.row.id)}
        >
          {params.value}
        </Link>
      ),
    },
    {
      field: 'status',
      headerName: 'STATUS',
      flex: 0.9,
      minWidth: 110,
      sortable: false,
      filterable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => {
        if (params.row.status === 'running') {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress
                size={14}
                thickness={5}
                sx={{ color: '#6366F1' }}
              />
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>
                Running
              </Typography>
            </Box>
          );
        }

        return <StatusPill status={params.row.status} />;
      },
    },
    {
      field: 'browser',
      headerName: 'BROWSER',
      flex: 0.9,
      minWidth: 110,
      sortable: false,
      filterable: false,
      align: 'left',
      headerAlign: 'left',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{params.row.browser || '-'}</Box>
      ),
    },
    {
      field: 'environment',
      headerName: 'ENVIRONMENT',
      flex: 1,
      minWidth: 130,
      sortable: false,
      filterable: false,
      align: 'left',
      headerAlign: 'left',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{params.row.environment || '-'}</Box>
      ),
    },
    {
      field: 'tag',
      headerName: 'TAG',
      flex: 0.8,
      minWidth: 90,
      sortable: false,
      filterable: false,
      align: 'left',
      headerAlign: 'left',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {(params.value || []).map((tag: string, index: number) => (
            <Chip
              key={`${tag}-${index}`}
              label={tag}
              size="small"
              sx={{
                backgroundColor: '#EEF2FF',
                color: '#3730A3',
                fontWeight: 500,
              }}
            />
          ))}
        </Box>
      ),
    },
    {
      field: 'duration',
      headerName: 'DURATION',
      flex: 0.9,
      minWidth: 105,
      sortable: false,
      filterable: false,
      align: 'center',
      headerAlign: 'center',
      valueGetter: (_value, row) => formatDuration(row.startedAt, row.finishedAt),
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{params.value}</Box>
      ),
    },
    {
      field: 'passRate',
      headerName: 'PASS RATE',
      flex: 1.1,
      minWidth: 140,
      sortable: false,
      filterable: false,
      align: 'left',
      headerAlign: 'left',
      renderCell: (params: GridRenderCellParams) => <ProgressCell value={params.row.passRate || 0} />,
    },
    {
      field: 'startedAt',
      headerName: 'STARTED',
      flex: 1.25,
      minWidth: 170,
      sortable: false,
      filterable: false,
      align: 'right',
      headerAlign: 'right',
      valueGetter: (_value, row) => formatDate(row.startedAt),
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>{params.value}</Box>
      ),
    },
    {
      field: 'finishedAt',
      headerName: 'FINISHED',
      flex: 1.25,
      minWidth: 170,
      sortable: false,
      filterable: false,
      align: 'right',
      headerAlign: 'right',
      valueGetter: (_value, row) => formatDate(row.finishedAt),
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>{params.value}</Box>
      ),
    },
  ];

  return (
    <Card
      sx={{
        width: '100%',
        borderRadius: '16px',
        border: '1px solid rgba(0, 0, 0, 0.08)',
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
          columnHeaderHeight={56}
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
            '& .MuiDataGrid-columnHeader, & .MuiDataGrid-columnHeaderTitle': {
              height: '56px',
              display: 'flex',
              alignItems: 'center',
            },
            '& .MuiDataGrid-row': {
              height: '64px !important',
            },
            '& .MuiDataGrid-cell': {
              display: 'flex',
              alignItems: 'center',
            },
          }}
        />
      </Box>
    </Card>
  );
}
