import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { all, get, run } from '../db/database.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  const users = await all(
    'SELECT id, username, email, role, created_at FROM users'
  );
  res.json({ status: 'success', users });
});

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  const user = await get(
    'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
    [req.user.id]
  );
  res.json({ status: 'success', user });
});

// Update user role (admin only)
router.patch('/:userId/role', authenticate, authorize('admin'), async (req, res) => {
  const { role } = req.body;
  
  if (!['user', 'admin'].includes(role)) {
    throw new AppError('Invalid role', 400);
  }

  await run('UPDATE users SET role = ? WHERE id = ?', [role, req.params.userId]);
  res.json({ status: 'success', message: 'User role updated' });
});

export default router;
