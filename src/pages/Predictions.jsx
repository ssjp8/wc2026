import { useState, useEffect } from 'react';

export default function Predictions({ api }) {
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('scheduled');

  useEffect(() => {
    loadMatches();
  }, [filter]);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const res = await api.getMatches(filter || undefined);
      setMatches(res.data.matches);

      // Load user predictions
      const predictionsRes = await api.getUserPredictions();
      const predMap = {};
      predictionsRes.data.predictions.forEach((pred) => {
        predMap[pred.match_id] = {
          home: pred.predicted_home_score,
          away: pred.predicted_away_score,
          id: pred.id,
        };
      });
      setPredictions(predMap);
    } catch (err) {
      setError('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const handlePredictionChange = (matchId, team, value) => {
    setPredictions({
      ...predictions,
      [matchId]: {
        ...predictions[matchId],
        [team]: parseInt(value) || 0,
      },
    });
  };

  const handleSubmitPrediction = async (matchId) => {
    try {
      setError('');
      const pred = predictions[matchId];
      if (pred.home === undefined || pred.away === undefined) {
        setError('Please enter both scores');
        return;
      }

      await api.makePrediction(matchId, {
        predicted_home_score: pred.home,
        predicted_away_score: pred.away,
      });

      setSuccess('Prediction saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save prediction');
    }
  };

  if (loading) return <div className="card">Loading matches...</div>;

  return (
    <div>
      <h2>🎯 Make Predictions</h2>

      <div className="card">
        <label htmlFor="filter">Filter by Status:</label>
        <select
          id="filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '0.5rem',
            marginLeft: '1rem',
            borderRadius: '4px',
            border: '1px solid #ddd',
          }}
        >
          <option value="scheduled">Upcoming</option>
          <option value="finished">Finished</option>
          <option value="">All</option>
        </select>
      </div>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      {matches.length === 0 ? (
        <div className="card">No matches found.</div>
      ) : (
        <div className="matches-grid">
          {matches.map((match) => {
            const pred = predictions[match.id] || { home: '', away: '' };
            return (
              <div key={match.id} className="match-card">
                <div className="match-header">
                  <span>{new Date(match.match_date).toLocaleDateString()}</span>
                  <span className={`match-status ${match.status}`}>{match.status}</span>
                </div>

                <div className="match-teams">
                  <div className="team">
                    <div className="team-name">{match.home_team}</div>
                  </div>
                  <div className="vs">vs</div>
                  <div className="team">
                    <div className="team-name">{match.away_team}</div>
                  </div>
                </div>

                {match.status === 'finished' && (
                  <div className="score">
                    <span>{match.home_score}</span>
                    <span>-</span>
                    <span>{match.away_score}</span>
                  </div>
                )}

                {match.status === 'scheduled' && (
                  <>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      <input
                        type="number"
                        min="0"
                        max="15"
                        className="score-input"
                        placeholder="Home"
                        value={pred.home || ''}
                        onChange={(e) => handlePredictionChange(match.id, 'home', e.target.value)}
                      />
                      <span style={{ alignSelf: 'center' }}>-</span>
                      <input
                        type="number"
                        min="0"
                        max="15"
                        className="score-input"
                        placeholder="Away"
                        value={pred.away || ''}
                        onChange={(e) => handlePredictionChange(match.id, 'away', e.target.value)}
                      />
                    </div>
                    <div className="prediction-controls">
                      <button
                        className="submit-btn"
                        onClick={() => handleSubmitPrediction(match.id)}
                      >
                        {pred.id ? 'Update' : 'Predict'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
