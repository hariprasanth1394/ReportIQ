import React, { useState } from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const drawerWidth = 240;

export default function MainLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F4F6F8' }}>
      {/* Sidebar */}
      <Sidebar 
        drawerWidth={drawerWidth} 
        mobileOpen={mobileOpen} 
        handleDrawerToggle={handleDrawerToggle} 
      />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
        }}
      >
        {/* Top AppBar */}
        <Topbar handleDrawerToggle={handleDrawerToggle} />

        {/* Content Area - 24px padding */}
        <Box
          sx={{
            flexGrow: 1,
            p: 3,
            overflow: 'auto',
            bgcolor: '#F4F6F8',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
