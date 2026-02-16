import React, { useState } from 'react';
import { ThemeProvider, CssBaseline, Drawer, IconButton, Typography, Button, Box, Container, Stack, Chip, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Divider, Tooltip } from '@mui/material';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ExecutionDetailPage from './pages/ExecutionDetailPage.jsx';
import TestCaseDetailPage from './pages/TestCaseDetailPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import theme from './theme.js';

function PrivateRoute({ children, roles }) {
  const { token, user, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

const drawerWidthExpanded = 260;
const drawerWidthCollapsed = 72;

function Sidebar() {
  const { token, user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const canManageUsers = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/', show: true },
    { text: 'Users', icon: <PeopleIcon />, path: '/users', show: canManageUsers },
  ];

  if (!token) return null;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidthExpanded : drawerWidthCollapsed,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? drawerWidthExpanded : drawerWidthCollapsed,
          boxSizing: 'border-box',
          borderRight: 'none',
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          borderImageSource: 'linear-gradient(180deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%)',
          borderImageSlice: 1,
          borderRight: '3px solid',
          transition: 'width 0.3s ease',
          overflowX: 'hidden',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Logo Section */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: open ? 'space-between' : 'center',
            minHeight: 80,
          }}
        >
          {open && (
            <Box
              component="img"
              src="/logo.svg"
              alt="ReportIQ"
              sx={{
                height: 48,
                width: 220,
                objectFit: 'contain',
                objectPosition: 'left center',
              }}
            />
          )}
          <IconButton
            onClick={() => setOpen(!open)}
            sx={{
              bgcolor: 'rgba(37, 99, 235, 0.08)',
              '&:hover': {
                bgcolor: 'rgba(37, 99, 235, 0.15)',
              },
            }}
          >
            {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: 'rgba(37, 99, 235, 0.12)' }} />

        {/* Navigation Items */}
        <List sx={{ px: 1, pt: 2, flex: 1 }}>
          {menuItems.filter(item => item.show).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Tooltip key={item.text} title={!open ? item.text : ''} placement="right">
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    sx={{
                      borderRadius: 2,
                      minHeight: 48,
                      justifyContent: open ? 'initial' : 'center',
                      px: 2.5,
                      background: isActive
                        ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(59, 130, 246, 0.12) 100%)'
                        : 'transparent',
                      borderLeft: isActive ? '3px solid #2563eb' : '3px solid transparent',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : 'auto',
                        justifyContent: 'center',
                        color: isActive ? '#2563eb' : '#64748b',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {open && (
                      <ListItemText
                        primary={item.text}
                        sx={{
                          '& .MuiTypography-root': {
                            fontWeight: isActive ? 600 : 500,
                            color: isActive ? '#1e293b' : '#64748b',
                          },
                        }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              </Tooltip>
            );
          })}
        </List>

        <Divider sx={{ borderColor: 'rgba(37, 99, 235, 0.12)' }} />

        {/* User Profile & Logout */}
        <Box sx={{ p: 2 }}>
          {open && (
            <Box sx={{ mb: 2, px: 1 }}>
              <Stack spacing={0.5}>
                <Typography variant="body2" fontWeight={600} color="text.primary">
                  {user?.name || user?.email}
                </Typography>
                <Chip
                  label={user?.role || 'USER'}
                  size="small"
                  sx={{
                    width: 'fit-content',
                    background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                    color: '#ffffff',
                    fontWeight: 600,
                  }}
                />
              </Stack>
            </Box>
          )}
          <Tooltip title={!open ? 'Logout' : ''} placement="right">
            <Button
              fullWidth={open}
              onClick={logout}
              startIcon={<LogoutIcon />}
              sx={{
                justifyContent: open ? 'flex-start' : 'center',
                minWidth: open ? 'auto' : 40,
                px: open ? 2 : 1,
              }}
              variant="outlined"
            >
              {open && 'Logout'}
            </Button>
          </Tooltip>
        </Box>
      </Box>
    </Drawer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              bgcolor: '#fafbfc',
              backgroundImage: 'linear-gradient(135deg, #fafbfc 0%, #f1f5f9 50%, #e0f2fe 100%)',
              minHeight: '100vh',
            }}
          >
            <Container maxWidth="xl" sx={{ py: 4 }}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <DashboardPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <PrivateRoute roles={["SUPER_ADMIN", "ADMIN"]}>
                      <UsersPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/runs/:runId"
                  element={
                    <PrivateRoute>
                      <ExecutionDetailPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/runs/:runId/test-cases/:testCaseId"
                  element={
                    <PrivateRoute>
                      <TestCaseDetailPage />
                    </PrivateRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Container>
          </Box>
        </Box>
      </ThemeProvider>
    </AuthProvider>
  );
}
