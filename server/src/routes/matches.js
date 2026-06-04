import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { all, get, run } from '../db/database.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// Get all matches
router.get('/', async (req, res) => {
  const { status } = req.query;
  let query = 'SELECT * FROM matches ORDER BY match_date ASC';
  const params = [];

  if (status) {
    query = 'SELECT * FROM matches WHERE status = ? ORDER BY match_date ASC';
    params.push(status);
  }

  const matches = await all(query, params);
  res.json({ status: 'success', matches });
});

// Get single match with all predictions
router.get('/:matchId', authenticate, async (req, res) => {
  const match = await get('SELECT * FROM matches WHERE id = ?', [req.params.matchId]);
  
  if (!match) {
    throw new AppError('Match not found', 404);
  }

  const predictions = await all(
    'SELECT * FROM predictions WHERE match_id = ?',
    [req.params.matchId]
  );

  res.json({ status: 'success', match, predictions });
});

// Add/Update match result (admin only)
router.patch('/:matchId/result', authenticate, authorize('admin'), async (req, res) => {
  const { home_score, away_score } = req.body;

  if (home_score === undefined || away_score === undefined) {
    throw new AppError('Missing scores', 400);
  }

  const match = await get('SELECT * FROM matches WHERE id = ?', [req.params.matchId]);
  
  if (!match) {
    throw new AppError('Match not found', 404);
  }

  // Update match
  await run(
    'UPDATE matches SET home_score = ?, away_score = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [home_score, away_score, 'finished', req.params.matchId]
  );

  // Calculate and update points for all predictions
  const predictions = await all(
    'SELECT * FROM predictions WHERE match_id = ?',
    [req.params.matchId]
  );

  for (const prediction of predictions) {
    const points = calculateMatchPoints(
      prediction.predicted_home_score,
      prediction.predicted_away_score,
      home_score,
      away_score
    );

    await run(
      'UPDATE predictions SET points = ? WHERE id = ?',
      [points, prediction.id]
    );

    // Update user total points
    const userPoints = await get(
      'SELECT * FROM user_points WHERE user_id = ?',
      [prediction.user_id]
    );

    const newTotal = (userPoints?.total_points || 0) + points;
    
    if (userPoints) {
      await run(
        'UPDATE user_points SET total_points = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
        [newTotal, prediction.user_id]
      );
    } else {
      await run(
        'INSERT INTO user_points (user_id, total_points) VALUES (?, ?)',
        [prediction.user_id, newTotal]
      );
    }
  }

  res.json({ status: 'success', message: 'Match result updated' });
});

function calculateMatchPoints(predHome, predAway, actualHome, actualAway) {
  let points = 0;
  
  // 5 points for exact score
  if (predHome === actualHome && predAway === actualAway) {
    points = 5;
  }
  // 3 points for correct result
  else if (
    (predHome > predAway && actualHome > actualAway) ||
    (predHome < predAway && actualHome < actualAway) ||
    (predHome === predAway && actualHome === actualAway)
  ) {
    points = 3;
  }
  
  return points;
}

export default router;
