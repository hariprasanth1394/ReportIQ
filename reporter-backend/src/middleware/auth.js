import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { usersStore, statuses } from '../store/usersStore.js';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: 'Missing bearer token' });
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = usersStore.getById(payload.id);
    if (!user || user.status !== statuses.ACTIVE) {
      return res.status(401).json({ message: 'User is disabled or missing' });
    }
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function authorizeRoles(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return next();
  };
}
