import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  alpha,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import LockResetIcon from '@mui/icons-material/LockReset';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const ROLE_OPTIONS = ['SUPER_ADMIN', 'ADMIN', 'USER'];
const STATUS_OPTIONS = ['ACTIVE', 'DISABLED'];

export default function UsersPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const canManageUsers = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [recoveryPassword, setRecoveryPassword] = useState('');

  const [form, setForm] = useState({ name: '', email: '', role: 'USER', password: '' });
  const [editForm, setEditForm] = useState({ role: 'USER', status: 'ACTIVE' });
  const [resetForm, setResetForm] = useState({ newPassword: '' });

  const roleOptions = useMemo(() => {
    if (isSuperAdmin) return ROLE_OPTIONS;
    return ROLE_OPTIONS.filter((role) => role !== 'SUPER_ADMIN');
  }, [isSuperAdmin]);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/users');
      setUsers(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canManageUsers) loadUsers();
  }, [canManageUsers]);

  const handleCreate = async () => {
    try {
      await api.post('/api/users', form);
      setCreateOpen(false);
      setForm({ name: '', email: '', role: 'USER', password: '' });
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create user');
    }
  };

  const openEdit = (target) => {
    setSelectedUser(target);
    setEditForm({ role: target.role, status: target.status });
    setEditOpen(true);
  };

  const handleEdit = async () => {
    try {
      if (editForm.role !== selectedUser.role) {
        await api.patch(`/api/users/${selectedUser.id}/role`, { role: editForm.role });
      }
      if (editForm.status !== selectedUser.status) {
        await api.patch(`/api/users/${selectedUser.id}/status`, { status: editForm.status });
      }
      setEditOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update user');
    }
  };

  const openReset = (target) => {
    setSelectedUser(target);
    setResetForm({ newPassword: '' });
    setResetOpen(true);
  };

  const handleResetPassword = async () => {
    try {
      await api.post(`/api/users/${selectedUser.id}/reset-password`, resetForm);
      setResetOpen(false);
      setSelectedUser(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reset password');
    }
  };

  const handleRecoveryPassword = async (target) => {
    try {
      const res = await api.post(`/api/users/${target.id}/recovery-password`);
      setRecoveryPassword(res.data.tempPassword);
      setSelectedUser(target);
      setRecoveryOpen(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to generate recovery password');
    }
  };

  if (!canManageUsers) {
    return (
      <Box sx={{ p: 4 }}>
        <Card 
          elevation={0}
          sx={{ 
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            p: 6,
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#111827' }}>
            Access Restricted
          </Typography>
          <Typography color="text.secondary">
            You do not have permission to view this page.
          </Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Box>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
        >
          <Box>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600, 
                color: '#111827',
                mb: 0.5,
              }}
            >
              User Management
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#64748b',
                fontSize: '0.875rem',
              }}
            >
              Manage user roles, status, and password recovery securely
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
            sx={{
              bgcolor: '#2563eb',
              textTransform: 'none',
              borderRadius: 2,
              fontWeight: 500,
              px: 3,
              '&:hover': { bgcolor: '#1d4ed8' },
            }}
          >
            Add User
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert 
          severity="error"
          sx={{ 
            borderRadius: 3,
            border: '1px solid',
            borderColor: alpha('#ef4444', 0.2),
          }}
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Card 
          elevation={0}
          sx={{ 
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'white',
            overflow: 'hidden',
          }}
        >
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell 
                    sx={{ 
                      bgcolor: '#f8fafc',
                      fontWeight: 700,
                      color: '#475569',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      py: 2,
                      borderBottom: '2px solid',
                      borderColor: 'divider',
                    }}
                  >
                    Name
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      bgcolor: '#f8fafc',
                      fontWeight: 700,
                      color: '#475569',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      py: 2,
                      borderBottom: '2px solid',
                      borderColor: 'divider',
                    }}
                  >
                    Email
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      bgcolor: '#f8fafc',
                      fontWeight: 700,
                      color: '#475569',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      py: 2,
                      borderBottom: '2px solid',
                      borderColor: 'divider',
                    }}
                  >
                    Role
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      bgcolor: '#f8fafc',
                      fontWeight: 700,
                      color: '#475569',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      py: 2,
                      borderBottom: '2px solid',
                      borderColor: 'divider',
                    }}
                  >
                    Status
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      bgcolor: '#f8fafc',
                      fontWeight: 700,
                      color: '#475569',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      py: 2,
                      borderBottom: '2px solid',
                      borderColor: 'divider',
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((row) => (
                  <TableRow 
                    key={row.id} 
                    hover
                    sx={{
                      transition: 'background-color 0.2s',
                      '&:hover': { 
                        bgcolor: alpha('#2563eb', 0.04),
                      },
                    }}
                  >
                    <TableCell sx={{ py: 2.5, fontWeight: 500, color: '#111827' }}>
                      {row.name}
                    </TableCell>
                    <TableCell sx={{ py: 2.5, color: '#64748b' }}>
                      {row.email}
                    </TableCell>
                    <TableCell sx={{ py: 2.5 }}>
                      <Chip 
                        label={row.role} 
                        size="small"
                        sx={{
                          bgcolor: row.role === 'SUPER_ADMIN' 
                            ? alpha('#f59e0b', 0.1)
                            : alpha('#2563eb', 0.1),
                          color: row.role === 'SUPER_ADMIN' 
                            ? '#d97706'
                            : '#2563eb',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          height: 24,
                          borderRadius: 1.5,
                          '& .MuiChip-label': { px: 1.5 },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 2.5 }}>
                      <Chip 
                        label={row.status} 
                        size="small"
                        sx={{
                          bgcolor: row.status === 'ACTIVE' 
                            ? alpha('#10b981', 0.1)
                            : alpha('#64748b', 0.1),
                          color: row.status === 'ACTIVE' 
                            ? '#059669'
                            : '#475569',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          height: 24,
                          borderRadius: 1.5,
                          '& .MuiChip-label': { px: 1.5 },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 2.5 }}>
                      <Stack direction="row" spacing={1}>
                        <Button 
                          size="small" 
                          variant="outlined"
                          startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                          onClick={() => openEdit(row)}
                          sx={{
                            textTransform: 'none',
                            borderRadius: 1.5,
                            fontSize: '0.8125rem',
                            fontWeight: 500,
                            px: 1.5,
                            py: 0.5,
                            minWidth: 'auto',
                            borderColor: alpha('#2563eb', 0.3),
                            color: '#2563eb',
                            '&:hover': {
                              borderColor: '#2563eb',
                              bgcolor: alpha('#2563eb', 0.04),
                            },
                          }}
                        >
                          Edit
                        </Button>
                        {isSuperAdmin && (
                          <>
                            <Button 
                              size="small" 
                              variant="outlined"
                              startIcon={<LockResetIcon sx={{ fontSize: 16 }} />}
                              onClick={() => openReset(row)}
                              sx={{
                                textTransform: 'none',
                                borderRadius: 1.5,
                                fontSize: '0.8125rem',
                                fontWeight: 500,
                                px: 1.5,
                                py: 0.5,
                                minWidth: 'auto',
                                borderColor: alpha('#f59e0b', 0.3),
                                color: '#f59e0b',
                                '&:hover': {
                                  borderColor: '#f59e0b',
                                  bgcolor: alpha('#f59e0b', 0.04),
                                },
                              }}
                            >
                              Reset
                            </Button>
                            <Button 
                              size="small" 
                              variant="contained"
                              startIcon={<VpnKeyIcon sx={{ fontSize: 16 }} />}
                              onClick={() => handleRecoveryPassword(row)}
                              sx={{
                                textTransform: 'none',
                                borderRadius: 1.5,
                                fontSize: '0.8125rem',
                                fontWeight: 500,
                                px: 1.5,
                                py: 0.5,
                                minWidth: 'auto',
                                bgcolor: '#10b981',
                                '&:hover': {
                                  bgcolor: '#059669',
                                },
                              }}
                            >
                              Recovery
                            </Button>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell 
                      colSpan={5} 
                      align="center" 
                      sx={{ 
                        py: 8, 
                        color: '#9ca3af',
                        fontSize: '0.95rem',
                      }}
                    >
                      No users created yet. Click "Add User" to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add User</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <TextField
              select
              label="Role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              {roleOptions.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Temporary Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              helperText="Minimum 8 characters. Share securely."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              select
              label="Role"
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
            >
              {roleOptions.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Status"
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
            >
              {STATUS_OPTIONS.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEdit}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={resetOpen} onClose={() => setResetOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Set a new password for {selectedUser?.email}.
            </Typography>
            <TextField
              label="New Password"
              type="password"
              value={resetForm.newPassword}
              onChange={(e) => setResetForm({ newPassword: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleResetPassword}>Reset</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={recoveryOpen} onClose={() => setRecoveryOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Recovery Password</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Temporary recovery password for {selectedUser?.email}. Share securely with the user.
            </Typography>
            <TextField value={recoveryPassword} InputProps={{ readOnly: true }} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRecoveryOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
