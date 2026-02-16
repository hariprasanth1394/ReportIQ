import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/client.js';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('Hariprasanthtest@gmail.com');
  const [password, setPassword] = useState('Inferno0!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(username, password);
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    setForgotMessage('');
    try {
      const res = await api.post('/api/auth/forgot-password', { email: forgotEmail });
      setForgotMessage(res.data?.message || 'Check your email for reset instructions.');
    } catch (err) {
      setForgotMessage(err.response?.data?.message || 'Unable to request reset.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Paper elevation={0} sx={{ maxWidth: 1040, width: '100%', overflow: 'hidden' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' } }}>
          <Box sx={{ p: { xs: 4, md: 6 } }}>
            <Stack spacing={3}>
              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton size="small" sx={{ bgcolor: 'rgba(96,165,250,0.2)' }}>
                  <AssessmentOutlinedIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" sx={{ bgcolor: 'rgba(129,140,248,0.2)' }}>
                  <TimelineOutlinedIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" sx={{ bgcolor: 'rgba(56,189,248,0.2)' }}>
                  <ShieldOutlinedIcon fontSize="small" />
                </IconButton>
              </Stack>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Welcome back
                </Typography>
                <Typography color="text.secondary">
                  Sign in to your Reporter workspace to access execution analytics.
                </Typography>
              </Box>
              {error && <Alert severity="error">{error}</Alert>}
              <Box component="form" onSubmit={onSubmit}>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Button variant="text" color="secondary" onClick={() => setForgotOpen(true)}>
                      Forgot password?
                    </Button>
                  </Stack>
                  <Button type="submit" variant="contained" size="large" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Box>
          <Box
            sx={{
              bgcolor: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              p: { xs: 4, md: 6 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              component="svg"
              viewBox="0 0 400 300"
              sx={{ width: '100%', maxWidth: 360, height: 'auto' }}
            >
              <defs>
                <linearGradient id="dashGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
                </linearGradient>
              </defs>
              <rect x="20" y="20" width="360" height="260" rx="24" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
              <rect x="45" y="50" width="140" height="80" rx="16" fill="url(#dashGradient)" opacity="0.8" />
              <rect x="205" y="50" width="150" height="80" rx="16" fill="#f1f5f9" />
              <rect x="45" y="150" width="310" height="20" rx="10" fill="#e2e8f0" />
              <rect x="45" y="180" width="240" height="20" rx="10" fill="#e2e8f0" />
              <circle cx="300" cy="200" r="28" fill="url(#dashGradient)" />
              <path d="M70 230 L110 210 L150 225 L190 190 L230 205 L270 170 L330 190" stroke="url(#dashGradient)" strokeWidth="6" fill="none" strokeLinecap="round" />
            </Box>
          </Box>
        </Box>
      </Paper>

      <Dialog open={forgotOpen} onClose={() => setForgotOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Password recovery</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Enter your email to request a reset. If email delivery is unavailable, contact your administrator.
            </Typography>
            <TextField
              label="Email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
            />
            {forgotMessage && <Alert severity="info">{forgotMessage}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setForgotOpen(false)}>Close</Button>
          <Button variant="contained" onClick={handleForgot}>Request reset</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
