import axios from 'axios';
import { run, all, get } from '../db/database.js';

// World Cup 2026 competition ID in football-data.org
const COMPETITION_ID = 2001; // This needs to be verified

export async function fetchMatchesFromAPI() {
  try {
    const response = await axios.get(
      `${process.env.FOOTBALL_API_BASE_URL}/competitions/${COMPETITION_ID}/matches`,
      {
        headers: { 'X-Auth-Token': process.env.FOOTBALL_API_KEY }
      }
    );

    const matches = response.data.matches || [];

    for (const match of matches) {
      const existing = await get(
        'SELECT id FROM matches WHERE fifa_id = ?',
        [match.id]
      );

      if (!existing) {
        await run(
          `INSERT INTO matches (fifa_id, home_team, away_team, match_date, stage, status)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            match.id,
            match.homeTeam.name,
            match.awayTeam.name,
            match.utcDate,
            match.stage,
            'scheduled'
          ]
        );
      } else if (match.status === 'FINISHED') {
        // Update finished match
        await run(
          `UPDATE matches SET home_score = ?, away_score = ?, status = ? WHERE fifa_id = ?`,
          [
            match.score.fullTime.home,
            match.score.fullTime.away,
            'finished',
            match.id
          ]
        );

        // Recalculate points for this match
        const predictions = await all(
          'SELECT * FROM predictions WHERE match_id = (SELECT id FROM matches WHERE fifa_id = ?)',
          [match.id]
        );

        for (const prediction of predictions) {
          const points = calculateMatchPoints(
            prediction.predicted_home_score,
            prediction.predicted_away_score,
            match.score.fullTime.home,
            match.score.fullTime.away
          );

          await run(
            'UPDATE predictions SET points = ? WHERE id = ?',
            [points, prediction.id]
          );

          // Update user points
          await run(
            `UPDATE user_points 
             SET total_points = (SELECT SUM(points) FROM predictions WHERE user_id = ?)
             WHERE user_id = ?`,
            [prediction.user_id, prediction.user_id]
          );
        }
      }
    }

    console.log(`✅ Fetched ${matches.length} matches from API`);
    return matches.length;
  } catch (error) {
    console.error('❌ Error fetching matches:', error.message);
    return 0;
  }
}

function calculateMatchPoints(predHome, predAway, actualHome, actualAway) {
  if (predHome === actualHome && predAway === actualAway) return 5;
  if ((predHome > predAway && actualHome > actualAway) ||
      (predHome < predAway && actualHome < actualAway) ||
      (predHome === predAway && actualHome === actualAway)) return 3;
  return 0;
}
