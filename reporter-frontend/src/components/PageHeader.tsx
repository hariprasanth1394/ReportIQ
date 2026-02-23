import React from 'react';
import { Box, IconButton, Badge, TextField, InputAdornment } from '@mui/material';
import { Bell, Search } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        mb: 3,
        px: 8,
        pt: 6
      }}
    >
      {/* Left Side - Title & Subtitle */}
      <Box>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 600,
            margin: 0,
            color: '#111827',
            letterSpacing: '-0.5px'
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: '#6B7280',
            margin: '6px 0 0 0',
            fontWeight: 400
          }}
        >
          {subtitle}
        </p>
      </Box>

      {/* Right Side - Search & Notification */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '300px' }}>
        {/* Search Input */}
        <TextField
          placeholder="Search..."
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={16} color="#9CA3AF" />
              </InputAdornment>
            )
          }}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              height: '38px',
              backgroundColor: '#F9FAFB',
              fontSize: '13px',
              borderRadius: '12px',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              '&:hover': {
                backgroundColor: '#F3F4F6'
              },
              '&.Mui-focused': {
                backgroundColor: '#FFFFFF',
                borderColor: 'rgba(0, 0, 0, 0.1)'
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

        {/* Notification Button */}
        <IconButton
          size="medium"
          sx={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            backgroundColor: '#F9FAFB',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            color: '#6B7280',
            '&:hover': {
              backgroundColor: '#F3F4F6'
            }
          }}
        >
          <Badge badgeContent={3} color="error" overlap="circular">
            <Bell size={18} />
          </Badge>
        </IconButton>
      </Box>
    </Box>
  );
}
