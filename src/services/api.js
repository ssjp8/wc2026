import axios from 'axios';

const client = axios.create();

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function createApiClient(apiUrl) {
  return {
    // Auth
    register: (username, email, password) =>
      client.post(`${apiUrl}/auth/register`, { username, email, password }),
    login: (username, password) =>
      client.post(`${apiUrl}/auth/login`, { username, password }),

    // Users
    getProfile: () => client.get(`${apiUrl}/users/profile`),
    getAllUsers: () => client.get(`${apiUrl}/users`),

    // Matches
    getMatches: (status) => client.get(`${apiUrl}/matches`, { params: { status } }),
    getMatch: (matchId) => client.get(`${apiUrl}/matches/${matchId}`),
    createMatch: (data) => client.post(`${apiUrl}/admin/matches`, data),
    updateMatchResult: (matchId, scores) =>
      client.patch(`${apiUrl}/matches/${matchId}/result`, scores),

    // Predictions
    getUserPredictions: () => client.get(`${apiUrl}/predictions/user`),
    getMatchPredictions: (matchId) => client.get(`${apiUrl}/predictions/match/${matchId}`),
    makePrediction: (matchId, prediction) =>
      client.post(`${apiUrl}/predictions/${matchId}`, prediction),
    deletePrediction: (predictionId) =>
      client.delete(`${apiUrl}/predictions/${predictionId}`),

    // Points
    getLeaderboard: () => client.get(`${apiUrl}/points/leaderboard`),
    getUserPoints: () => client.get(`${apiUrl}/points/user`),
    getPointsBreakdown: () => client.get(`${apiUrl}/points/breakdown`),

    // Analytics
    getStats: () => client.get(`${apiUrl}/analytics/stats`),
    getAccuracy: () => client.get(`${apiUrl}/analytics/accuracy`),
    getPopularPredictions: () => client.get(`${apiUrl}/analytics/popular-predictions`),

    // Admin
    deleteUser: (userId) => client.delete(`${apiUrl}/admin/users/${userId}`),
    recalculatePoints: () => client.post(`${apiUrl}/admin/recalculate-points`),
  };
}
