import React, { Suspense, lazy } from 'react';
import { ThemeProvider, CssBaseline, Drawer, Typography, Button, Box, Container, Stack, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Divider, Tooltip } from '@mui/material';
import { Routes, Route, Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import TimelineIcon from '@mui/icons-material/Timeline';
import LogoutIcon from '@mui/icons-material/Logout';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import theme from './theme.js';

const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const ExecutionDetailPage = lazy(() => import('./pages/ExecutionDetailPage.jsx'));
const TestCaseDetailPage = lazy(() => import('./pages/TestCaseDetailPage.jsx'));
const UsersPage = lazy(() => import('./pages/UsersPage.jsx'));
const ExecutionRunsPage = lazy(() => import('./pages/ExecutionRunsPage.tsx').then((module) => ({ default: module.ExecutionRunsPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage.tsx').then((module) => ({ default: module.AnalyticsPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage.tsx').then((module) => ({ default: module.SettingsPage })));

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

function ExecutionRunsRoute() {
  const navigate = useNavigate();

  return (
    <ExecutionRunsPage
      onNavigateToDetail={(runId) => navigate(`/runs/${runId}`)}
    />
  );
}

function Sidebar() {
  const { token, user, logout } = useAuth();
  const location = useLocation();
  const canManageUsers = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/', show: true },
    { text: 'Execution Runs', icon: <PlayCircleOutlineIcon />, path: '/execution-runs', show: true },
    { text: 'Analytics', icon: <BarChartIcon />, path: '/analytics', show: true },
    { text: 'Users', icon: <PeopleIcon />, path: '/users', show: canManageUsers },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings', show: true },
  ];

  if (!token) return null;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidthExpanded,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidthExpanded,
          boxSizing: 'border-box',
          border: 'none',
          background: 'linear-gradient(180deg, #1E3A8A 0%, #2563EB 100%)',
          overflowX: 'hidden',
          boxShadow: '4px 0 12px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Logo Section */}
        <Box
          sx={{
            px: 2,
            py: 2.25,
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            minHeight: 80,
          }}
        >
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: 2,
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TimelineIcon sx={{ color: 'white', fontSize: 18 }} />
          </Box>
          <Box>
            <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 26, lineHeight: 1 }}>ReportIQ</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.72)', fontSize: 11, lineHeight: 1.2 }}>Test Analytics</Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />

        {/* Navigation Items */}
        <List sx={{ px: 1.25, pt: 2, flex: 1 }}>
          {menuItems.filter(item => item.show).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Tooltip key={item.text} title="" placement="right">
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    sx={{
                      borderRadius: 2.5,
                      minHeight: 46,
                      justifyContent: 'initial',
                      px: 1.9,
                      color: isActive ? 'white' : 'rgba(255, 255, 255, 0.78)',
                      background: isActive
                        ? 'rgba(255, 255, 255, 0.15)'
                        : 'transparent',
                      border: isActive ? '1px solid rgba(255,255,255,0.25)' : '1px solid transparent',
                      backdropFilter: isActive ? 'blur(10px)' : 'none',
                      '&:hover': {
                        background: isActive ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.08)',
                        color: 'white',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: 1.6,
                        justifyContent: 'center',
                        color: 'inherit',
                        '& .MuiSvgIcon-root': {
                          fontSize: 18,
                        },
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      sx={{
                        '& .MuiTypography-root': {
                          fontWeight: isActive ? 600 : 500,
                          fontSize: 14,
                          color: 'inherit',
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </Tooltip>
            );
          })}
        </List>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />

        {/* User Profile & Logout */}
        <Box sx={{ p: 1.5 }}>
          <Box
            sx={{
              mb: 1.5,
              p: 1.5,
              borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                bgcolor: 'rgba(139, 92, 246, 0.95)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ color: 'white', fontWeight: 600, fontSize: 13, lineHeight: 1.2 }} noWrap>
                {user?.name || 'User'}
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, lineHeight: 1.2 }} noWrap>
                {user?.email || 'user@example.com'}
              </Typography>
            </Box>
          </Box>
          <Tooltip title="" placement="right">
            <Button
              fullWidth
              onClick={logout}
              startIcon={<LogoutIcon />}
              sx={{
                justifyContent: 'flex-start',
                minWidth: 'auto',
                px: 1.5,
                color: 'rgba(255, 255, 255, 0.85)',
                borderColor: 'rgba(255, 255, 255, 0.35)',
                '&:hover': {
                  borderColor: '#fca5a5',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  color: '#fca5a5',
                },
              }}
              variant="outlined"
            >
              Logout
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
        <Box sx={{ display: 'flex', height: '100vh' }}>
          <Sidebar />
          <Box
            component="main"
            sx={{
              flex: 1,
              overflow: 'auto',
              background: '#F9FAFB',
              p: 4,
            }}
          >
            <Container maxWidth={false} sx={{ maxWidth: 1600, mx: 'auto', py: 0, px: 0 }}>
              <Suspense
                fallback={(
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <Typography variant="body2" color="text.secondary">Loading...</Typography>
                  </Box>
                )}
              >
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
                    path="/execution-runs"
                    element={
                      <PrivateRoute>
                        <ExecutionRunsRoute />
                      </PrivateRoute>
                    }
                  />
                  <Route path="/executions" element={<Navigate to="/execution-runs" replace />} />
                  <Route
                    path="/analytics"
                    element={
                      <PrivateRoute>
                        <AnalyticsPage />
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
                    path="/settings"
                    element={
                      <PrivateRoute>
                        <SettingsPage />
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
              </Suspense>
            </Container>
          </Box>
        </Box>
      </ThemeProvider>
    </AuthProvider>
  );
}
