import { useState, useEffect } from 'react';

export default function Dashboard({ api, user }) {
  const [stats, setStats] = useState(null);
  const [userPoints, setUserPoints] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [statsRes, pointsRes, predictionsRes] = await Promise.all([
        api.getStats(),
        api.getUserPoints(),
        api.getUserPredictions(),
      ]);

      setStats(statsRes.data.stats);
      setUserPoints(pointsRes.data.points);
      setPredictions(predictionsRes.data.predictions.slice(0, 5));
    } catch (err) {
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="card">Loading dashboard...</div>;
  if (error) return <div className="alert error">{error}</div>;

  return (
    <div>
      <h2>📊 Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{stats?.total_users || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Your Points</div>
          <div className="stat-value">{userPoints?.total_points || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Matches</div>
          <div className="stat-value">{stats?.total_matches || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Finished Matches</div>
          <div className="stat-value">{stats?.finished_matches || 0}</div>
        </div>
      </div>

      <div className="card">
        <h3>📅 Your Recent Predictions</h3>
        {predictions.length > 0 ? (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Match</th>
                <th>Your Prediction</th>
                <th>Actual Score</th>
                <th>Points</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((pred) => (
                <tr key={pred.id}>
                  <td>
                    {pred.home_team} vs {pred.away_team}
                  </td>
                  <td>
                    {pred.predicted_home_score} - {pred.predicted_away_score}
                  </td>
                  <td>
                    {pred.home_score !== null ? `${pred.home_score} - ${pred.away_score}` : 'TBD'}
                  </td>
                  <td>{pred.points || 0}</td>
                  <td>
                    <span className={`match-status ${pred.status}`}>{pred.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>You haven't made any predictions yet. Go to "Make Predictions" to get started!</p>
        )}
      </div>
    </div>
  );
}
