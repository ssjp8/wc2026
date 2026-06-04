import { useState, useEffect } from 'react';
import './App.css';
import { createApiClient } from './services/api';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Predictions from './pages/Predictions';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';
import Analytics from './pages/Analytics';

function App({ apiUrl }) {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [api] = useState(() => createApiClient(apiUrl));

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setPage('login');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return (
      <>
        {page === 'login' ? (
          <Login api={api} onLogin={handleLogin} onSwitchPage={() => setPage('register')} />
        ) : (
          <Register api={api} onRegister={handleLogin} onSwitchPage={() => setPage('login')} />
        )}
      </>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>🏆 World Cup 2026 Prediction Game</h1>
          <nav className="nav">
            <button
              className={`nav-btn ${page === 'dashboard' ? 'active' : ''}`}
              onClick={() => setPage('dashboard')}
            >
              Dashboard
            </button>
            <button
              className={`nav-btn ${page === 'predictions' ? 'active' : ''}`}
              onClick={() => setPage('predictions')}
            >
              Make Predictions
            </button>
            <button
              className={`nav-btn ${page === 'leaderboard' ? 'active' : ''}`}
              onClick={() => setPage('leaderboard')}
            >
              Leaderboard
            </button>
            <button
              className={`nav-btn ${page === 'analytics' ? 'active' : ''}`}
              onClick={() => setPage('analytics')}
            >
              Analytics
            </button>
            {user.role === 'admin' && (
              <button
                className={`nav-btn ${page === 'admin' ? 'active' : ''}`}
                onClick={() => setPage('admin')}
              >
                Admin
              </button>
            )}
            <div className="user-info">
              <span className="username">{user.username}</span>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="main">
        {page === 'dashboard' && <Dashboard api={api} user={user} />}
        {page === 'predictions' && <Predictions api={api} user={user} />}
        {page === 'leaderboard' && <Leaderboard api={api} />}
        {page === 'analytics' && <Analytics api={api} />}
        {page === 'admin' && user.role === 'admin' && <Admin api={api} />}
      </main>

      <footer className="footer">
        <p>World Cup 2026 © 2026 | Predict, Compete, Win!</p>
      </footer>
    </div>
  );
}

export default App;
