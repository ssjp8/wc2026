import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { all, get, run } from '../db/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { calculatePoints } from '../services/pointsCalculator.js';

const router = express.Router();

// Get all predictions for a user
router.get('/user', authenticate, async (req, res) => {
  const predictions = await all(
    `SELECT p.*, m.home_team, m.away_team, m.home_score, m.away_score, m.match_date, m.status
     FROM predictions p
     JOIN matches m ON p.match_id = m.id
     WHERE p.user_id = ?
     ORDER BY m.match_date DESC`,
    [req.user.id]
  );
  res.json({ status: 'success', predictions });
});

// Get predictions for a match
router.get('/match/:matchId', authenticate, async (req, res) => {
  const predictions = await all(
    `SELECT p.*, u.username
     FROM predictions p
     JOIN users u ON p.user_id = u.id
     WHERE p.match_id = ?
     ORDER BY u.username ASC`,
    [req.params.matchId]
  );
  res.json({ status: 'success', predictions });
});

// Create or update a prediction
router.post('/:matchId', authenticate, async (req, res) => {
  const { predicted_home_score, predicted_away_score } = req.body;
  
  if (predicted_home_score === undefined || predicted_away_score === undefined) {
    throw new AppError('Missing score predictions', 400);
  }

  // Check if match exists and is not finished
  const match = await get('SELECT * FROM matches WHERE id = ?', [req.params.matchId]);
  
  if (!match) {
    throw new AppError('Match not found', 404);
  }

  if (match.status === 'finished') {
    throw new AppError('Cannot predict for finished match', 400);
  }

  // Check if prediction already exists
  const existing = await get(
    'SELECT id FROM predictions WHERE user_id = ? AND match_id = ?',
    [req.user.id, req.params.matchId]
  );

  if (existing) {
    await run(
      'UPDATE predictions SET predicted_home_score = ?, predicted_away_score = ? WHERE id = ?',
      [predicted_home_score, predicted_away_score, existing.id]
    );
    res.json({ status: 'success', message: 'Prediction updated' });
  } else {
    const result = await run(
      'INSERT INTO predictions (user_id, match_id, predicted_home_score, predicted_away_score) VALUES (?, ?, ?, ?)',
      [req.user.id, req.params.matchId, predicted_home_score, predicted_away_score]
    );
    res.json({ status: 'success', message: 'Prediction created', id: result.id });
  }
});

// Delete a prediction
router.delete('/:predictionId', authenticate, async (req, res) => {
  const prediction = await get(
    'SELECT * FROM predictions WHERE id = ? AND user_id = ?',
    [req.params.predictionId, req.user.id]
  );

  if (!prediction) {
    throw new AppError('Prediction not found', 404);
  }

  const match = await get('SELECT status FROM matches WHERE id = ?', [prediction.match_id]);
  
  if (match.status === 'finished') {
    throw new AppError('Cannot delete prediction for finished match', 400);
  }

  await run('DELETE FROM predictions WHERE id = ?', [req.params.predictionId]);
  res.json({ status: 'success', message: 'Prediction deleted' });
});

export default router;
