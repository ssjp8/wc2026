import { useState, useEffect } from 'react';

export default function Admin({ api }) {
  const [activeTab, setActiveTab] = useState('matches');
  const [matches, setMatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [newMatch, setNewMatch] = useState({
    home_team: '',
    away_team: '',
    match_date: '',
    stage: '',
  });
  const [matchResult, setMatchResult] = useState({
    matchId: '',
    home_score: '',
    away_score: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (activeTab === 'matches') loadMatches();
    if (activeTab === 'users') loadUsers();
  }, [activeTab]);

  const loadMatches = async () => {
    try {
      const res = await api.getMatches();
      setMatches(res.data.matches);
    } catch (err) {
      setError('Failed to load matches');
    }
  };

  const loadUsers = async () => {
    try {
      const res = await api.getAllUsers();
      setUsers(res.data.users);
    } catch (err) {
      setError('Failed to load users');
    }
  };

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.createMatch(newMatch);
      setSuccess('Match created successfully!');
      setNewMatch({ home_team: '', away_team: '', match_date: '', stage: '' });
      loadMatches();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create match');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMatchResult = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.updateMatchResult(matchResult.matchId, {
        home_score: parseInt(matchResult.home_score),
        away_score: parseInt(matchResult.away_score),
      });
      setSuccess('Match result updated successfully!');
      setMatchResult({ matchId: '', home_score: '', away_score: '' });
      loadMatches();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update match result');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await api.deleteUser(userId);
        setSuccess('User deleted successfully!');
        loadUsers();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to delete user');
      }
    }
  };

  const handleRecalculatePoints = async () => {
    try {
      setLoading(true);
      await api.recalculatePoints();
      setSuccess('Points recalculated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to recalculate points');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>⚙️ Admin Panel</h2>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          className={`nav-btn ${activeTab === 'matches' ? 'active' : ''}`}
          onClick={() => setActiveTab('matches')}
        >
          Manage Matches
        </button>
        <button
          className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Manage Users
        </button>
        <button
          className={`nav-btn ${activeTab === 'recalc' ? 'active' : ''}`}
          onClick={() => setActiveTab('recalc')}
        >
          Recalculate Points
        </button>
      </div>

      {activeTab === 'matches' && (
        <div>
          <div className="card">
            <h3>➕ Create New Match</h3>
            <form onSubmit={handleCreateMatch}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="home_team">Home Team</label>
                  <input
                    id="home_team"
                    type="text"
                    value={newMatch.home_team}
                    onChange={(e) => setNewMatch({ ...newMatch, home_team: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="away_team">Away Team</label>
                  <input
                    id="away_team"
                    type="text"
                    value={newMatch.away_team}
                    onChange={(e) => setNewMatch({ ...newMatch, away_team: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="match_date">Match Date</label>
                  <input
                    id="match_date"
                    type="datetime-local"
                    value={newMatch.match_date}
                    onChange={(e) => setNewMatch({ ...newMatch, match_date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="stage">Stage</label>
                  <input
                    id="stage"
                    type="text"
                    placeholder="e.g., Group Stage"
                    value={newMatch.stage}
                    onChange={(e) => setNewMatch({ ...newMatch, stage: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Creating...' : 'Create Match'}
              </button>
            </form>
          </div>

          <div className="card">
            <h3>📋 All Matches</h3>
            {matches.length === 0 ? (
              <p>No matches found.</p>
            ) : (
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>Home Team</th>
                    <th>Away Team</th>
                    <th>Date</th>
                    <th>Result</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((match) => (
                    <tr key={match.id}>
                      <td>{match.home_team}</td>
                      <td>{match.away_team}</td>
                      <td>{new Date(match.match_date).toLocaleString()}</td>
                      <td>
                        {match.status === 'finished'
                          ? `${match.home_score} - ${match.away_score}`
                          : 'TBD'}
                      </td>
                      <td>
                        <span className={`match-status ${match.status}`}>{match.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card">
            <h3>📊 Update Match Result</h3>
            <form onSubmit={handleUpdateMatchResult}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="matchId">Match ID</label>
                  <input
                    id="matchId"
                    type="number"
                    value={matchResult.matchId}
                    onChange={(e) => setMatchResult({ ...matchResult, matchId: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="home_score">Home Score</label>
                  <input
                    id="home_score"
                    type="number"
                    min="0"
                    value={matchResult.home_score}
                    onChange={(e) => setMatchResult({ ...matchResult, home_score: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="away_score">Away Score</label>
                  <input
                    id="away_score"
                    type="number"
                    min="0"
                    value={matchResult.away_score}
                    onChange={(e) => setMatchResult({ ...matchResult, away_score: e.target.value })}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Updating...' : 'Update Result'}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card">
          <h3>👥 Manage Users</h3>
          {users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="cancel-btn"
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'recalc' && (
        <div className="card">
          <h3>🔄 Recalculate Points</h3>
          <p>Click the button below to recalculate all users' points based on finished matches.</p>
          <button
            className="btn"
            onClick={handleRecalculatePoints}
            disabled={loading}
            style={{ maxWidth: '300px' }}
          >
            {loading ? 'Recalculating...' : 'Recalculate All Points'}
          </button>
        </div>
      )}
    </div>
  );
}
