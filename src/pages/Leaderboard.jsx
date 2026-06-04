import { useState, useEffect } from 'react';

export default function Leaderboard({ api }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const res = await api.getLeaderboard();
      setLeaderboard(res.data.leaderboard);
    } catch (err) {
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="card">Loading leaderboard...</div>;
  if (error) return <div className="alert error">{error}</div>;

  return (
    <div>
      <h2>🏆 Leaderboard</h2>

      {leaderboard.length === 0 ? (
        <div className="card">No predictions yet.</div>
      ) : (
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th>Total Points</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, index) => (
              <tr key={entry.id}>
                <td>
                  <span className={`rank ${index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : ''}`}>
                    #{index + 1}
                  </span>
                </td>
                <td>{entry.username}</td>
                <td>{entry.total_points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
