import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { all, get } from '../db/database.js';

const router = express.Router();

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  const leaderboard = await all(
    `SELECT u.id, u.username, up.total_points, up.rank
     FROM user_points up
     JOIN users u ON up.user_id = u.id
     ORDER BY up.total_points DESC
     LIMIT 100`
  );
  res.json({ status: 'success', leaderboard });
});

// Get user's points
router.get('/user', authenticate, async (req, res) => {
  const points = await get(
    'SELECT * FROM user_points WHERE user_id = ?',
    [req.user.id]
  );
  res.json({ status: 'success', points: points || { user_id: req.user.id, total_points: 0 } });
});

// Get detailed points breakdown
router.get('/breakdown', authenticate, async (req, res) => {
  const breakdown = await all(
    `SELECT p.match_id, p.points, m.home_team, m.away_team, m.home_score, m.away_score
     FROM predictions p
     JOIN matches m ON p.match_id = m.id
     WHERE p.user_id = ? AND m.status = 'finished'
     ORDER BY m.match_date DESC`,
    [req.user.id]
  );
  
  const total = breakdown.reduce((sum, item) => sum + (item.points || 0), 0);
  
  res.json({ status: 'success', breakdown, total });
});

export default router;
