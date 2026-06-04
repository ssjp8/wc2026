import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { run, get } from '../db/database.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    throw new AppError('Missing required fields', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const result = await run(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, 'user']
    );

    const token = jwt.sign(
      { id: result.id, username, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      status: 'success',
      token,
      user: { id: result.id, username, email, role: 'user' }
    });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      throw new AppError('Username or email already exists', 409);
    }
    throw err;
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new AppError('Missing credentials', 400);
  }

  const user = await get(
    'SELECT * FROM users WHERE username = ?',
    [username]
  );

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  
  if (!passwordMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.json({
    status: 'success',
    token,
    user: { id: user.id, username: user.username, email: user.email, role: user.role }
  });
});

export default router;
