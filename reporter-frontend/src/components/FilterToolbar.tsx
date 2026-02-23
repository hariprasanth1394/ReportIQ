import React, { useMemo, useState } from 'react';
import { Box, Card, TextField, InputAdornment, Button, Menu, MenuItem } from '@mui/material';
import { ChevronDown, Filter, Search } from 'lucide-react';

const menuPaperSx = {
  borderRadius: '12px',
  border: '1px solid rgba(0, 0, 0, 0.06)',
  minWidth: 200,
  boxShadow: '0 6px 16px rgba(15, 23, 42, 0.08)'
};

const menuItemSx = {
  fontSize: '13px',
  padding: '8px 16px',
  '&:hover': {
    backgroundColor: '#F9FAFB'
  },
  '&.Mui-selected': {
    backgroundColor: '#EEF2FF',
    fontWeight: 500
  },
  '&.Mui-selected:hover': {
    backgroundColor: '#E0E7FF'
  }
};

const filterButtonSx = {
  height: '36px',
  borderRadius: '10px',
  backgroundColor: 'transparent',
  fontSize: '13px',
  fontWeight: 500,
  textTransform: 'none',
  color: '#374151',
  padding: '0 12px',
  minWidth: '140px',
  justifyContent: 'space-between',
  '&:hover': {
    backgroundColor: '#F3F4F6'
  }
};

type FilterKey = 'dateRange' | 'browser' | 'status' | 'tag' | 'environment';

interface FilterState {
  dateRange: string;
  browser: string;
  status: string;
  tag: string;
  environment: string;
  search: string;
}

interface FilterToolbarProps {
  filters: FilterState;
  onFilterChange: (key: FilterKey, value: string) => void;
  onSearchChange: (value: string) => void;
}

export function FilterToolbar({ filters, onFilterChange, onSearchChange }: FilterToolbarProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const filterGroups = useMemo(
    () => [
      {
        key: 'dateRange',
        label: 'Date Range',
        options: [
          { value: 'all', label: 'All Dates' },
          { value: 'today', label: 'Today' },
          { value: 'week', label: 'Last 7 days' },
          { value: 'month', label: 'Last 30 days' }
        ]
      },
      {
        key: 'browser',
        label: 'Browser',
        options: [
          { value: 'all', label: 'All Browsers' },
          { value: 'chrome', label: 'Chrome' },
          { value: 'firefox', label: 'Firefox' },
          { value: 'safari', label: 'Safari' }
        ]
      },
      {
        key: 'status',
        label: 'Status',
        options: [
          { value: 'all', label: 'All Status' },
          { value: 'passed', label: 'Passed' },
          { value: 'failed', label: 'Failed' },
          { value: 'running', label: 'Running' }
        ]
      },
      {
        key: 'tag',
        label: 'Tag',
        options: [
          { value: 'all', label: 'All Tags' },
          { value: 'regression', label: 'Regression' },
          { value: 'smoke', label: 'Smoke' },
          { value: 'critical', label: 'Critical' }
        ]
      },
      {
        key: 'environment',
        label: 'Environment',
        options: [
          { value: 'all', label: 'All Environments' },
          { value: 'production', label: 'Production' },
          { value: 'staging', label: 'Staging' }
        ]
      }
    ],
    []
  );

  const openMenu = (event: React.MouseEvent<HTMLButtonElement>, key: string) => {
    setAnchorEl(event.currentTarget);
    setActiveMenu(key);
  };

  const closeMenu = () => {
    setAnchorEl(null);
    setActiveMenu(null);
  };

  const getDisplayLabel = (key: FilterKey, label: string, options: { value: string; label: string }[]) => {
    const value = filters[key];
    if (!value || value === 'all') return label;
    return options.find(option => option.value === value)?.label || label;
  };

  return (
    <Card
      sx={{
        border: '1px solid rgba(0, 0, 0, 0.06)',
        borderRadius: '16px',
        padding: '16px 20px',
        boxShadow: 'none',
        backgroundColor: '#FFFFFF',
        mb: 3,
        width: '100%'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <Filter size={16} color="#9CA3AF" />
          <span style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Filters:</span>
        </Box>

        {filterGroups.map(filter => (
          <React.Fragment key={filter.key}>
            <Button
              aria-haspopup="true"
              onClick={(event) => openMenu(event, filter.key)}
              endIcon={<ChevronDown size={14} />}
              sx={filterButtonSx}
            >
              {getDisplayLabel(filter.key as FilterKey, filter.label, filter.options)}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={activeMenu === filter.key}
              onClose={closeMenu}
              elevation={2}
              PaperProps={{ sx: menuPaperSx }}
              MenuListProps={{ dense: true }}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
              {filter.options.map(option => (
                <MenuItem
                  key={option.value}
                  selected={filters[filter.key as FilterKey] === option.value}
                  onClick={() => {
                    onFilterChange(filter.key as FilterKey, option.value);
                    closeMenu();
                  }}
                  sx={menuItemSx}
                >
                  {option.label}
                </MenuItem>
              ))}
            </Menu>
          </React.Fragment>
        ))}

        <Box sx={{ marginLeft: 'auto', width: 280, flexShrink: 0 }}>
          <TextField
            placeholder="Search by name or ID..."
            size="small"
            value={filters.search}
            onChange={(event) => onSearchChange(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} color="#9CA3AF" />
                </InputAdornment>
              )
            }}
            sx={{
              width: '100%',
              '& .MuiOutlinedInput-root': {
                height: '36px',
                backgroundColor: 'transparent',
                fontSize: '13px',
                borderRadius: '10px',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                '&:hover': {
                  backgroundColor: '#F3F4F6',
                  borderColor: 'rgba(0, 0, 0, 0.1)'
                },
                '&.Mui-focused': {
                  backgroundColor: '#FFFFFF',
                  borderColor: 'rgba(0, 0, 0, 0.12)'
                }
              },
              '& .MuiOutlinedInput-input': {
                padding: '8px 12px',
                '&::placeholder': {
                  color: '#9CA3AF',
                  opacity: 1
                }
              }
            }}
          />
        </Box>
      </Box>
    </Card>
  );
}
