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
} from '@mui/material';
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
      <Paper sx={{ p: 4 }}>
        <Typography variant="h6">Access restricted</Typography>
        <Typography color="text.secondary">You do not have permission to view this page.</Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5">Users</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage roles, status, and password recovery securely.
          </Typography>
        </Box>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>
          Add User
        </Button>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>
                    <Chip label={row.role} size="small" color={row.role === 'SUPER_ADMIN' ? 'warning' : 'primary'} variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip label={row.status} size="small" color={row.status === 'ACTIVE' ? 'success' : 'default'} variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                      <Button size="small" variant="outlined" onClick={() => openEdit(row)}>
                        Edit
                      </Button>
                      {isSuperAdmin && (
                        <>
                          <Button size="small" variant="outlined" onClick={() => openReset(row)}>
                            Reset Password
                          </Button>
                          <Button size="small" variant="contained" onClick={() => handleRecoveryPassword(row)}>
                            Recovery Password
                          </Button>
                        </>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No users created yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
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
