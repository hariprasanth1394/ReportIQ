import express from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { authenticate } from '../middleware/auth.js';
import { usersStore } from '../store/usersStore.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  const email = (username || '').trim().toLowerCase();
  const user = await usersStore.verifyPassword(email, password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  if (user.status !== 'ACTIVE') return res.status(403).json({ message: 'User is disabled' });
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    config.jwtSecret,
    { expiresIn: config.tokenExpiry },
  );
  return res.json({
    token,
    expiresIn: config.tokenExpiry,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status },
  });
});

router.get('/me', authenticate, (req, res) => {
  return res.json({ user: req.user });
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body || {};
  const result = await usersStore.createResetToken(email, config.resetTokenExpiryMinutes);
  return res.json({
    message: 'If the account exists, a reset link has been sent. Please contact your administrator if needed.',
    resetToken: config.exposeResetToken ? result?.token : undefined,
    expiresAt: config.exposeResetToken ? new Date(Date.now() + config.resetTokenExpiryMinutes * 60 * 1000).toISOString() : undefined,
  });
});

router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body || {};
  try {
    const tokenInfo = await usersStore.verifyResetToken(token);
    if (!tokenInfo) return res.status(400).json({ message: 'Invalid or expired reset token' });
    await usersStore.resetPassword(tokenInfo.userId, newPassword);
    await usersStore.deleteResetToken(tokenInfo.tokenId);
    return res.json({ message: 'Password reset successful' });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

export default router;
