import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import TimelineIcon from '@mui/icons-material/Timeline';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Execution Runs', icon: <PlayCircleOutlineIcon />, path: '/executions' },
  { text: 'Analytics', icon: <BarChartIcon />, path: '/analytics' },
  { text: 'Users', icon: <PeopleIcon />, path: '/users' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

export default function Sidebar({ drawerWidth, mobileOpen, handleDrawerToggle }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        background: 'linear-gradient(180deg, #1E3A8A 0%, #2563EB 100%)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Logo Section */}
      <Box 
        sx={{ 
          p: 3, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.5,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
        >
          <TimelineIcon sx={{ color: 'white', fontSize: 26 }} />
        </Box>
        <Box>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'white', 
              fontWeight: 700, 
              fontSize: 19,
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            ReportIQ
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.75)',
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            Test Analytics
          </Typography>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, px: 2, pt: 3, pb: 2 }}>
        <List sx={{ p: 0 }}>
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem 
                key={item.text} 
                disablePadding 
                sx={{ 
                  mb: index < menuItems.length - 1 ? '4px' : 0,
                }}
              >
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    minHeight: 48,
                    px: 2,
                    py: 1.5,
                    color: isActive ? 'white' : 'rgba(255, 255, 255, 0.75)',
                    bgcolor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                    backdropFilter: isActive ? 'blur(10px)' : 'none',
                    boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.15)' : 'none',
                    '&:hover': {
                      bgcolor: isActive ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.08)',
                      color: 'white',
                      transform: 'translateX(2px)',
                    },
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: 'inherit', 
                      minWidth: 40,
                      '& .MuiSvgIcon-root': {
                        fontSize: 22,
                        fontWeight: isActive ? 600 : 400,
                      }
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{
                      fontSize: 14,
                      fontWeight: isActive ? 600 : 500,
                      letterSpacing: '-0.01em',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* User Profile Section */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            mb: 1.5,
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <Avatar
            sx={{
              width: 38,
              height: 38,
              bgcolor: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
              fontSize: 15,
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                color: 'white',
                fontWeight: 600,
                fontSize: 13,
                lineHeight: 1.4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.name || 'User'}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.65)',
                fontSize: 11,
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              {user?.email || 'user@example.com'}
            </Typography>
          </Box>
        </Box>

        {/* Logout Button */}
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            minHeight: 44,
            px: 2,
            py: 1.25,
            color: 'rgba(255, 255, 255, 0.75)',
            '&:hover': {
              bgcolor: 'rgba(239, 68, 68, 0.15)',
              color: '#fca5a5',
              '& .MuiListItemIcon-root': {
                color: '#fca5a5',
              },
            },
            transition: 'all 0.2s',
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
            <LogoutIcon sx={{ fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText 
            primary="Logout" 
            primaryTypographyProps={{ 
              fontSize: 14, 
              fontWeight: 500,
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            border: 'none',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            border: 'none',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
