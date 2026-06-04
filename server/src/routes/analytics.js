import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { all, get } from '../db/database.js';

const router = express.Router();

// Get game statistics
router.get('/stats', authenticate, async (req, res) => {
  const totalUsers = await get('SELECT COUNT(*) as count FROM users');
  const totalMatches = await get('SELECT COUNT(*) as count FROM matches');
  const finishedMatches = await get("SELECT COUNT(*) as count FROM matches WHERE status = 'finished'");
  const totalPredictions = await get('SELECT COUNT(*) as count FROM predictions');

  res.json({
    status: 'success',
    stats: {
      total_users: totalUsers.count,
      total_matches: totalMatches.count,
      finished_matches: finishedMatches.count,
      pending_matches: totalMatches.count - finishedMatches.count,
      total_predictions: totalPredictions.count
    }
  });
});

// Get prediction accuracy analytics
router.get('/accuracy', authenticate, async (req, res) => {
  const accuracy = await all(
    `SELECT u.username, 
            COUNT(p.id) as total_predictions,
            SUM(CASE WHEN p.points = 5 THEN 1 ELSE 0 END) as exact_scores,
            SUM(CASE WHEN p.points = 3 THEN 1 ELSE 0 END) as correct_results,
            SUM(CASE WHEN p.points = 0 THEN 1 ELSE 0 END) as wrong_predictions,
            ROUND(100.0 * SUM(CASE WHEN p.points > 0 THEN 1 ELSE 0 END) / COUNT(p.id), 2) as accuracy_percentage
     FROM predictions p
     JOIN users u ON p.user_id = u.id
     WHERE p.points IS NOT NULL
     GROUP BY u.id
     ORDER BY accuracy_percentage DESC`
  );

  res.json({ status: 'success', accuracy });
});

// Get most predicted results
router.get('/popular-predictions', async (req, res) => {
  const popular = await all(
    `SELECT CONCAT(m.home_team, ' ', p.predicted_home_score, ' - ', p.predicted_away_score, ' ', m.away_team) as prediction,
            COUNT(*) as user_count
     FROM predictions p
     JOIN matches m ON p.match_id = m.id
     GROUP BY p.match_id, p.predicted_home_score, p.predicted_away_score
     ORDER BY user_count DESC
     LIMIT 20`
  );

  res.json({ status: 'success', popular });
});

export default router;
