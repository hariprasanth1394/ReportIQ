import express from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { roles, statuses, usersStore } from '../store/usersStore.js';

const router = express.Router();

router.use(authenticate);

router.get('/', authorizeRoles([roles.SUPER_ADMIN, roles.ADMIN]), (_req, res) => {
  return res.json(usersStore.listUsers());
});

router.post('/', authorizeRoles([roles.SUPER_ADMIN, roles.ADMIN]), async (req, res) => {
  const { name, email, role, password } = req.body || {};
  if (role === roles.SUPER_ADMIN && req.user.role !== roles.SUPER_ADMIN) {
    return res.status(403).json({ message: 'Cannot assign Super Admin role' });
  }
  try {
    const user = await usersStore.createUser({ name, email, role, password });
    return res.status(201).json(user);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

router.patch('/:id/role', authorizeRoles([roles.SUPER_ADMIN, roles.ADMIN]), async (req, res) => {
  const { role } = req.body || {};
  const user = usersStore.getById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.role === roles.SUPER_ADMIN && req.user.role !== roles.SUPER_ADMIN) {
    return res.status(403).json({ message: 'Cannot modify Super Admin role' });
  }
  if (role === roles.SUPER_ADMIN && req.user.role !== roles.SUPER_ADMIN) {
    return res.status(403).json({ message: 'Cannot assign Super Admin role' });
  }
  try {
    const updated = await usersStore.updateRole(user, role);
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

router.patch('/:id/status', authorizeRoles([roles.SUPER_ADMIN, roles.ADMIN]), async (req, res) => {
  const { status } = req.body || {};
  const user = usersStore.getById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.role === roles.SUPER_ADMIN && req.user.role !== roles.SUPER_ADMIN) {
    return res.status(403).json({ message: 'Cannot modify Super Admin status' });
  }
  if (![statuses.ACTIVE, statuses.DISABLED].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  const updated = await usersStore.updateStatus(user, status);
  return res.json(updated);
});

router.post('/:id/reset-password', authorizeRoles([roles.SUPER_ADMIN]), async (req, res) => {
  const { newPassword } = req.body || {};
  const user = usersStore.getById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  try {
    const updated = await usersStore.resetPassword(user, newPassword);
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

router.post('/:id/recovery-password', authorizeRoles([roles.SUPER_ADMIN]), async (req, res) => {
  const user = usersStore.getById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const tempPassword = await usersStore.generateRecoveryPassword(user);
  return res.json({
    message: 'Temporary recovery password generated. Share securely with the user.',
    tempPassword,
  });
});

export default router;
