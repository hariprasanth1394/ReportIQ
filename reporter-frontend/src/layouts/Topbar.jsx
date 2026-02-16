import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  InputBase,
  Badge,
  Box,
  alpha,
  Paper,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';

export default function Topbar({ handleDrawerToggle }) {
  return (
    <AppBar
      position="sticky"
      elevation={1}
      sx={{
        bgcolor: 'white',
        borderBottom: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      }}
    >
      <Toolbar 
        sx={{ 
          minHeight: { xs: 64, sm: 70 },
          px: { xs: 2, sm: 3 },
          gap: 2,
        }}
      >
        {/* Mobile Menu Toggle */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ 
            mr: 1,
            display: { sm: 'none' },
            color: 'text.primary',
            '&:hover': {
              bgcolor: alpha('#2563eb', 0.08),
            },
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Search Bar */}
        <Paper
          elevation={0}
          sx={{
            position: 'relative',
            borderRadius: 2.5,
            backgroundColor: alpha('#f1f5f9', 0.8),
            border: '1px solid',
            borderColor: 'transparent',
            '&:hover': {
              backgroundColor: alpha('#f1f5f9', 1),
              borderColor: alpha('#2563eb', 0.1),
            },
            '&:focus-within': {
              backgroundColor: 'white',
              borderColor: '#2563eb',
              boxShadow: `0 0 0 3px ${alpha('#2563eb', 0.1)}`,
            },
            width: '100%',
            maxWidth: { xs: 200, sm: 320, md: 400 },
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <Box
            sx={{
              px: 2,
              height: '100%',
              position: 'absolute',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SearchIcon 
              sx={{ 
                color: 'text.secondary', 
                fontSize: 20,
              }} 
            />
          </Box>
          <InputBase
            placeholder="Search..."
            inputProps={{ 'aria-label': 'search' }}
            sx={{
              color: 'text.primary',
              width: '100%',
              '& .MuiInputBase-input': {
                py: 1.5,
                px: 1.5,
                pl: 5.5,
                fontSize: 14,
                fontWeight: 500,
                transition: 'width 0.2s',
                '&::placeholder': {
                  color: 'text.secondary',
                  opacity: 0.7,
                },
              },
            }}
          />
        </Paper>

        {/* Notifications */}
        <IconButton
          size="large"
          aria-label="show notifications"
          sx={{ 
            color: 'text.primary',
            ml: { xs: 0.5, sm: 1 },
            '&:hover': {
              bgcolor: alpha('#2563eb', 0.08),
              '& .MuiBadge-badge': {
                transform: 'scale(1.1)',
              },
            },
            transition: 'all 0.2s',
          }}
        >
          <Badge 
            badgeContent={4} 
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: 11,
                fontWeight: 600,
                height: 18,
                minWidth: 18,
                padding: '0 4px',
                transition: 'transform 0.2s',
              }
            }}
          >
            <NotificationsIcon sx={{ fontSize: 24 }} />
          </Badge>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
