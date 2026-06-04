import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { run, all, get } from '../db/database.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// Create match (admin only)
router.post('/matches', authenticate, authorize('admin'), async (req, res) => {
  const { fifa_id, home_team, away_team, match_date, stage } = req.body;

  if (!home_team || !away_team || !match_date) {
    throw new AppError('Missing required fields', 400);
  }

  const result = await run(
    'INSERT INTO matches (fifa_id, home_team, away_team, match_date, stage, status) VALUES (?, ?, ?, ?, ?, ?)',
    [fifa_id, home_team, away_team, match_date, stage, 'scheduled']
  );

  res.json({ status: 'success', message: 'Match created', id: result.id });
});

// Get all users (admin only)
router.get('/users', authenticate, authorize('admin'), async (req, res) => {
  const users = await all('SELECT id, username, email, role, created_at FROM users');
  res.json({ status: 'success', users });
});

// Delete user (admin only)
router.delete('/users/:userId', authenticate, authorize('admin'), async (req, res) => {
  await run('DELETE FROM predictions WHERE user_id = ?', [req.params.userId]);
  await run('DELETE FROM user_points WHERE user_id = ?', [req.params.userId]);
  await run('DELETE FROM users WHERE id = ?', [req.params.userId]);
  
  res.json({ status: 'success', message: 'User deleted' });
});

// Recalculate all points (admin only)
router.post('/recalculate-points', authenticate, authorize('admin'), async (req, res) => {
  // Clear existing points
  await run('UPDATE user_points SET total_points = 0');
  
  // Get all finished predictions
  const predictions = await all(
    `SELECT p.id, p.user_id, p.predicted_home_score, p.predicted_away_score, m.home_score, m.away_score
     FROM predictions p
     JOIN matches m ON p.match_id = m.id
     WHERE m.status = 'finished'`
  );

  for (const prediction of predictions) {
    const points = calculatePoints(
      prediction.predicted_home_score,
      prediction.predicted_away_score,
      prediction.home_score,
      prediction.away_score
    );

    await run('UPDATE predictions SET points = ? WHERE id = ?', [points, prediction.id]);
    
    // Update user total
    await run(
      `UPDATE user_points 
       SET total_points = (SELECT SUM(points) FROM predictions WHERE user_id = ?)
       WHERE user_id = ?`,
      [prediction.user_id, prediction.user_id]
    );
  }

  res.json({ status: 'success', message: 'Points recalculated' });
});

function calculatePoints(predHome, predAway, actualHome, actualAway) {
  if (predHome === actualHome && predAway === actualAway) return 5;
  if ((predHome > predAway && actualHome > actualAway) ||
      (predHome < predAway && actualHome < actualAway) ||
      (predHome === predAway && actualHome === actualAway)) return 3;
  return 0;
}

export default router;
