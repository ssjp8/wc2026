import { useState, useEffect } from 'react';

export default function Analytics({ api }) {
  const [accuracy, setAccuracy] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [accuracyRes, popularRes] = await Promise.all([
        api.getAccuracy(),
        api.getPopularPredictions(),
      ]);

      setAccuracy(accuracyRes.data.accuracy);
      setPopular(popularRes.data.popular);
    } catch (err) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="card">Loading analytics...</div>;
  if (error) return <div className="alert error">{error}</div>;

  return (
    <div>
      <h2>📈 Analytics</h2>

      <div className="card">
        <h3>Prediction Accuracy</h3>
        {accuracy.length === 0 ? (
          <p>No data available yet.</p>
        ) : (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Total Predictions</th>
                <th>Exact Scores</th>
                <th>Correct Results</th>
                <th>Accuracy %</th>
              </tr>
            </thead>
            <tbody>
              {accuracy.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.username}</td>
                  <td>{item.total_predictions}</td>
                  <td>{item.exact_scores}</td>
                  <td>{item.correct_results}</td>
                  <td>{item.accuracy_percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h3>Most Popular Predictions</h3>
        {popular.length === 0 ? (
          <p>No data available yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {popular.map((item, idx) => (
              <li key={idx} style={{ padding: '0.75rem', borderBottom: '1px solid #eee' }}>
                <strong>{item.prediction}</strong> - {item.user_count} users predicted this
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
