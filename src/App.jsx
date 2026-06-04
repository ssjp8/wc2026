import { useState, useEffect, useMemo } from "react";

// ============================================================
// DATA & CONSTANTS
// ============================================================

const WC2026_GROUPS = {
  A: ["USA", "Mexico", "Canada", "New Zealand"],
  B: ["Argentina", "Ecuador", "Peru", "Senegal"],
  C: ["Brazil", "Colombia", "Venezuela", "Japan"],
  D: ["France", "Belgium", "Poland", "Morocco"],
  E: ["England", "Netherlands", "Serbia", "Iran"],
  F: ["Spain", "Portugal", "Croatia", "Uruguay"],
  G: ["Germany", "Austria", "Switzerland", "Tunisia"],
  H: ["Italy", "Greece", "Albania", "Australia"],
  I: ["South Korea", "China", "Saudi Arabia", "Costa Rica"],
  J: ["Nigeria", "Cameroon", "Ghana", "Qatar"],
  K: ["Egypt", "Algeria", "Kenya", "Bolivia"],
  L: ["Turkey", "Czech Republic", "Slovakia", "Honduras"],
};

const FLAGS = {
  USA: "🇺🇸", Mexico: "🇲🇽", Canada: "🇨🇦", "New Zealand": "🇳🇿",
  Argentina: "🇦🇷", Ecuador: "🇪🇨", Peru: "🇵🇪", Senegal: "🇸🇳",
  Brazil: "🇧🇷", Colombia: "🇨🇴", Venezuela: "🇻🇪", Japan: "🇯🇵",
  France: "🇫🇷", Belgium: "🇧🇪", Poland: "🇵🇱", Morocco: "🇲🇦",
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", Netherlands: "🇳🇱", Serbia: "🇷🇸", Iran: "🇮🇷",
  Spain: "🇪🇸", Portugal: "🇵🇹", Croatia: "🇭🇷", Uruguay: "🇺🇾",
  Germany: "🇩🇪", Austria: "🇦🇹", Switzerland: "🇨🇭", Tunisia: "🇹🇳",
  Italy: "🇮🇹", Greece: "🇬🇷", Albania: "🇦🇱", Australia: "🇦🇺",
  "South Korea": "🇰🇷", China: "🇨🇳", "Saudi Arabia": "🇸🇦", "Costa Rica": "🇨🇷",
  Nigeria: "🇳🇬", Cameroon: "🇨🇲", Ghana: "🇬🇭", Qatar: "🇶🇦",
  Egypt: "🇪🇬", Algeria: "🇩🇿", Kenya: "🇰🇪", Bolivia: "🇧🇴",
  Turkey: "🇹🇷", "Czech Republic": "🇨🇿", Slovakia: "🇸🇰", Honduras: "🇭🇳",
};

const ALL_TEAMS = Object.values(WC2026_GROUPS).flat();

// Generate group stage matches
function generateGroupMatches() {
  const matches = [];
  let id = 1;
  Object.entries(WC2026_GROUPS).forEach(([group, teams]) => {
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        matches.push({
          id: id++,
          group,
          stage: "Group Stage",
          home: teams[i],
          away: teams[j],
          date: `2026-06-${String(11 + Math.floor((id - 1) / 8)).padStart(2, "0")}`,
          result: null,
        });
      }
    }
  });
  return matches;
}

const INITIAL_MATCHES = generateGroupMatches();

const SCORING_RULES = {
  correctResult: 1,     // correct W/D/L outcome
  correctScore: 3,      // exact scoreline
  correctGoalDiff: 2,   // correct goal difference (not exact)
  topScorer: 5,
  winner: 10,
  finalist: 5,
  semifinalist: 3,
};

// ============================================================
// STORAGE HELPERS
// ============================================================

function loadState(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}
function saveState(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ============================================================
// INITIAL DATA
// ============================================================

const INITIAL_USERS = [
  { id: 1, name: "Admin", email: "admin@wc2026.com", password: "admin123", role: "admin", avatar: "👑", joined: "2026-01-01" },
  { id: 2, name: "Alice", email: "alice@example.com", password: "alice123", role: "player", avatar: "⚽", joined: "2026-01-10" },
  { id: 3, name: "Bob", email: "bob@example.com", password: "bob123", role: "player", avatar: "🏆", joined: "2026-01-12" },
  { id: 4, name: "Carol", email: "carol@example.com", password: "carol123", role: "player", avatar: "🌟", joined: "2026-01-15" },
];

// ============================================================
// ICONS
// ============================================================

const Icon = ({ name, size = 16 }) => {
  const icons = {
    trophy: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
    users: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    settings: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    target: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    bar: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    edit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    lock: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    logout: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    ball: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>,
    star: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    crown: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M5 16v2"/><path d="M19 16v2"/><path d="M3 20h18"/></svg>,
    info: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  };
  return icons[name] || null;
};

// ============================================================
// POINTS CALCULATION
// ============================================================

function calcPoints(prediction, result) {
  if (!result || !prediction) return 0;
  let pts = 0;
  const ph = prediction.home, pa = prediction.away;
  const rh = result.home, ra = result.away;
  const predResult = ph > pa ? "H" : ph < pa ? "A" : "D";
  const actualResult = rh > ra ? "H" : rh < ra ? "A" : "D";
  if (predResult === actualResult) pts += SCORING_RULES.correctResult;
  if (ph === rh && pa === ra) {
    pts += SCORING_RULES.correctScore;
  } else if ((ph - pa) === (rh - ra) && predResult === actualResult) {
    pts += SCORING_RULES.correctGoalDiff;
  }
  return pts;
}

function calcAllPoints(users, predictions, matches) {
  const scores = {};
  users.forEach(u => scores[u.id] = { total: 0, correct: 0, exact: 0, breakdown: [] });
  matches.forEach(match => {
    if (!match.result) return;
    users.forEach(u => {
      const pred = (predictions[u.id] || []).find(p => p.matchId === match.id);
      if (!pred) return;
      const pts = calcPoints(pred, match.result);
      scores[u.id].total += pts;
      if (pts > 0) scores[u.id].correct++;
      if (pts >= SCORING_RULES.correctScore + SCORING_RULES.correctResult) scores[u.id].exact++;
      scores[u.id].breakdown.push({ matchId: match.id, pts });
    });
  });
  return scores;
}

// ============================================================
// MAIN APP
// ============================================================

export default function App() {
  const [users, setUsers] = useState(() => loadState("wc_users", INITIAL_USERS));
  const [matches, setMatches] = useState(() => loadState("wc_matches", INITIAL_MATCHES));
  const [predictions, setPredictions] = useState(() => loadState("wc_predictions", {}));
  const [currentUser, setCurrentUser] = useState(() => loadState("wc_current_user", null));
  const [view, setView] = useState("leaderboard");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [notification, setNotification] = useState(null);

  useEffect(() => saveState("wc_users", users), [users]);
  useEffect(() => saveState("wc_matches", matches), [matches]);
  useEffect(() => saveState("wc_predictions", predictions), [predictions]);
  useEffect(() => saveState("wc_current_user", currentUser), [currentUser]);

  const notify = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const scores = useMemo(() => calcAllPoints(users, predictions, matches), [users, predictions, matches]);

  const handleLogin = () => {
    const user = users.find(u => u.email === loginForm.email && u.password === loginForm.password);
    if (user) { setCurrentUser(user); setLoginError(""); setView("leaderboard"); }
    else setLoginError("Invalid email or password");
  };

  const handleLogout = () => { setCurrentUser(null); setView("leaderboard"); };

  if (!currentUser) return (
    <LoginScreen
      form={loginForm} setForm={setLoginForm}
      onLogin={handleLogin} error={loginError}
      users={users}
    />
  );

  const navItems = [
    { id: "leaderboard", label: "Leaderboard", icon: "trophy" },
    { id: "predictions", label: "My Predictions", icon: "target" },
    { id: "matches", label: "Matches", icon: "ball" },
    { id: "analytics", label: "Analytics", icon: "bar" },
    ...(currentUser.role === "admin" ? [
      { id: "admin_users", label: "Users", icon: "users" },
      { id: "admin_results", label: "Results", icon: "edit" },
      { id: "admin_app", label: "Admin", icon: "settings" },
    ] : []),
  ];

  return (
    <div style={styles.app}>
      {/* Background */}
      <div style={styles.bg} />

      {/* Notification */}
      {notification && (
        <div style={{ ...styles.notification, background: notification.type === "success" ? "#00C853" : "#FF1744" }}>
          {notification.type === "success" ? <Icon name="check" size={14} /> : <Icon name="x" size={14} />}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.logo}>⚽ WC2026</span>
          <span style={styles.logoSub}>Prediction Game</span>
        </div>
        <nav style={styles.nav}>
          {navItems.map(item => (
            <button
              key={item.id}
              style={{ ...styles.navBtn, ...(view === item.id ? styles.navBtnActive : {}) }}
              onClick={() => setView(item.id)}
            >
              <Icon name={item.icon} size={14} />
              <span style={styles.navLabel}>{item.label}</span>
            </button>
          ))}
        </nav>
        <div style={styles.userBadge}>
          <span style={styles.avatar}>{currentUser.avatar}</span>
          <span style={styles.userName}>{currentUser.name}</span>
          {currentUser.role === "admin" && <span style={styles.adminBadge}>ADMIN</span>}
          <button style={styles.logoutBtn} onClick={handleLogout} title="Logout">
            <Icon name="logout" size={14} />
          </button>
        </div>
      </header>

      {/* Main */}
      <main style={styles.main}>
        {view === "leaderboard" && <LeaderboardView users={users} scores={scores} matches={matches} />}
        {view === "predictions" && <PredictionsView user={currentUser} matches={matches} predictions={predictions} setPredictions={setPredictions} notify={notify} scores={scores} />}
        {view === "matches" && <MatchesView matches={matches} predictions={predictions} currentUser={currentUser} scores={scores} />}
        {view === "analytics" && <AnalyticsView users={users} matches={matches} predictions={predictions} scores={scores} />}
        {view === "admin_users" && currentUser.role === "admin" && <AdminUsersView users={users} setUsers={setUsers} notify={notify} />}
        {view === "admin_results" && currentUser.role === "admin" && <AdminResultsView matches={matches} setMatches={setMatches} notify={notify} />}
        {view === "admin_app" && currentUser.role === "admin" && <AdminAppView matches={matches} setMatches={setMatches} users={users} predictions={predictions} setPredictions={setPredictions} notify={notify} />}
      </main>
    </div>
  );
}

// ============================================================
// LOGIN SCREEN
// ============================================================

function LoginScreen({ form, setForm, onLogin, error, users }) {
  return (
    <div style={styles.loginPage}>
      <div style={styles.bg} />
      <div style={styles.loginCard}>
        <div style={styles.loginBadge}>FIFA WORLD CUP 2026™</div>
        <h1 style={styles.loginTitle}>Prediction<br />Game</h1>
        <p style={styles.loginSub}>Predict matches. Earn points. Glory awaits.</p>
        <div style={styles.loginForm}>
          <input
            style={styles.input} type="email" placeholder="Email address"
            value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && onLogin()}
          />
          <input
            style={styles.input} type="password" placeholder="Password"
            value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && onLogin()}
          />
          {error && <p style={styles.loginError}>{error}</p>}
          <button style={styles.loginBtn} onClick={onLogin}>Sign In ⚡</button>
        </div>
        <div style={styles.loginHint}>
          <p style={{ color: "#888", fontSize: 11, marginTop: 16, textAlign: "center" }}>Demo accounts:</p>
          {users.slice(0, 3).map(u => (
            <p key={u.id} style={{ color: "#666", fontSize: 11, textAlign: "center" }}>
              {u.email} / {u.password}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// LEADERBOARD VIEW
// ============================================================

function LeaderboardView({ users, scores, matches }) {
  const played = matches.filter(m => m.result).length;
  const total = matches.length;

  const ranked = [...users]
    .map(u => ({ ...u, ...scores[u.id] }))
    .sort((a, b) => b.total - a.total);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div style={styles.view}>
      <div style={styles.viewHeader}>
        <h2 style={styles.viewTitle}><Icon name="trophy" size={20} /> Leaderboard</h2>
        <div style={styles.matchProgress}>
          <span style={styles.progressLabel}>{played}/{total} matches played</span>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${(played / total) * 100}%` }} />
          </div>
        </div>
      </div>

      <div style={styles.podium}>
        {ranked.slice(0, 3).map((u, i) => (
          <div key={u.id} style={{ ...styles.podiumCard, ...(i === 0 ? styles.podiumFirst : {}) }}>
            <div style={styles.medal}>{medals[i]}</div>
            <div style={styles.podiumAvatar}>{u.avatar}</div>
            <div style={styles.podiumName}>{u.name}</div>
            <div style={styles.podiumScore}>{u.total}</div>
            <div style={styles.podiumPts}>pts</div>
            <div style={styles.podiumStats}>
              <span>{u.correct || 0} correct</span>
              <span>{u.exact || 0} exact</span>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.leaderTable}>
        <div style={styles.tableHead}>
          <span style={styles.thRank}>#</span>
          <span style={styles.thPlayer}>Player</span>
          <span style={styles.thNum}>Correct</span>
          <span style={styles.thNum}>Exact</span>
          <span style={styles.thPts}>Points</span>
        </div>
        {ranked.map((u, i) => (
          <div key={u.id} style={{ ...styles.tableRow, ...(i < 3 ? styles.tableRowTop : {}) }}>
            <span style={styles.tdRank}>{i + 1}</span>
            <span style={styles.tdPlayer}>
              <span style={{ fontSize: 18 }}>{u.avatar}</span>
              <span>{u.name}</span>
              {u.role === "admin" && <span style={styles.adminBadge}>ADMIN</span>}
            </span>
            <span style={styles.tdNum}>{u.correct || 0}</span>
            <span style={styles.tdNum}>{u.exact || 0}</span>
            <span style={styles.tdPts}>{u.total}</span>
          </div>
        ))}
      </div>

      <div style={styles.scoringCard}>
        <h3 style={styles.scoringTitle}><Icon name="info" size={14} /> Scoring System</h3>
        <div style={styles.scoringGrid}>
          <div style={styles.scoringItem}><span style={styles.scoringPts}>+{SCORING_RULES.correctResult}</span><span>Correct result (W/D/L)</span></div>
          <div style={styles.scoringItem}><span style={styles.scoringPts}>+{SCORING_RULES.correctGoalDiff}</span><span>Correct goal difference</span></div>
          <div style={styles.scoringItem}><span style={styles.scoringPts}>+{SCORING_RULES.correctScore}</span><span>Exact scoreline</span></div>
          <div style={styles.scoringItem}><span style={styles.scoringPts}>+{SCORING_RULES.winner}</span><span>Tournament winner</span></div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PREDICTIONS VIEW
// ============================================================

function PredictionsView({ user, matches, predictions, setPredictions, notify, scores }) {
  const [filter, setFilter] = useState("all");
  const [editingMatch, setEditingMatch] = useState(null);
  const [predForm, setPredForm] = useState({ home: "", away: "" });

  const userPreds = predictions[user.id] || [];

  const grouped = Object.entries(WC2026_GROUPS).map(([group, teams]) => ({
    group,
    matches: matches.filter(m => m.group === group),
  }));

  const filteredGroups = filter === "all" ? grouped
    : filter === "unpredicted" ? grouped.map(g => ({
      ...g,
      matches: g.matches.filter(m => !userPreds.find(p => p.matchId === m.id))
    })).filter(g => g.matches.length > 0)
    : grouped.filter(g => g.group === filter);

  const savePrediction = () => {
    const h = parseInt(predForm.home), a = parseInt(predForm.away);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) { notify("Enter valid scores (0+)", "error"); return; }
    const existing = userPreds.filter(p => p.matchId !== editingMatch.id);
    const updated = [...existing, { matchId: editingMatch.id, home: h, away: a, updatedAt: new Date().toISOString() }];
    setPredictions(prev => ({ ...prev, [user.id]: updated }));
    setEditingMatch(null);
    notify("Prediction saved! ⚽");
  };

  const myScore = scores[user.id] || { total: 0, correct: 0, exact: 0 };
  const predictedCount = userPreds.length;
  const totalMatches = matches.length;

  return (
    <div style={styles.view}>
      <div style={styles.viewHeader}>
        <h2 style={styles.viewTitle}><Icon name="target" size={20} /> My Predictions</h2>
      </div>

      {/* Stats row */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statNum}>{predictedCount}</div>
          <div style={styles.statLabel}>Predicted</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNum}>{totalMatches - predictedCount}</div>
          <div style={styles.statLabel}>Remaining</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNum}>{myScore.correct}</div>
          <div style={styles.statLabel}>Correct</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statNum, color: "#FFD700" }}>{myScore.total}</div>
          <div style={styles.statLabel}>Points</div>
        </div>
      </div>

      {/* Filter */}
      <div style={styles.filterRow}>
        <button style={{ ...styles.filterBtn, ...(filter === "all" ? styles.filterActive : {}) }} onClick={() => setFilter("all")}>All Groups</button>
        <button style={{ ...styles.filterBtn, ...(filter === "unpredicted" ? styles.filterActive : {}) }} onClick={() => setFilter("unpredicted")}>Unpredicted</button>
        {Object.keys(WC2026_GROUPS).map(g => (
          <button key={g} style={{ ...styles.filterBtn, ...(filter === g ? styles.filterActive : {}) }} onClick={() => setFilter(g)}>Group {g}</button>
        ))}
      </div>

      {/* Match groups */}
      {filteredGroups.map(({ group, matches: gMatches }) => (
        <div key={group} style={styles.groupSection}>
          <h3 style={styles.groupHeader}>Group {group}</h3>
          <div style={styles.matchGrid}>
            {gMatches.map(match => {
              const pred = userPreds.find(p => p.matchId === match.id);
              const hasResult = !!match.result;
              const pts = pred && hasResult ? calcPoints(pred, match.result) : null;
              return (
                <div key={match.id} style={{ ...styles.matchCard, ...(hasResult ? styles.matchCardPlayed : {}) }}>
                  <div style={styles.matchDate}>{match.date}</div>
                  <div style={styles.matchTeams}>
                    <span style={styles.teamName}>{FLAGS[match.home]} {match.home}</span>
                    <span style={styles.vs}>VS</span>
                    <span style={styles.teamName}>{FLAGS[match.away]} {match.away}</span>
                  </div>
                  {pred ? (
                    <div style={styles.predDisplay}>
                      <span style={styles.predScore}>{pred.home} — {pred.away}</span>
                      {hasResult && (
                        <span style={{ ...styles.ptsBadge, background: pts > 0 ? "#00C853" : "#444" }}>+{pts}pts</span>
                      )}
                      {!hasResult && (
                        <button style={styles.editPredBtn} onClick={() => { setEditingMatch(match); setPredForm({ home: pred.home, away: pred.away }); }}>
                          <Icon name="edit" size={12} /> Edit
                        </button>
                      )}
                    </div>
                  ) : (
                    <button style={styles.predictBtn} onClick={() => { setEditingMatch(match); setPredForm({ home: "", away: "" }); }} disabled={hasResult}>
                      {hasResult ? "Locked" : <><Icon name="plus" size={12} /> Predict</>}
                    </button>
                  )}
                  {hasResult && (
                    <div style={styles.actualResult}>Result: {match.result.home}–{match.result.away}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Modal */}
      {editingMatch && (
        <div style={styles.modal}>
          <div style={styles.modalCard}>
            <h3 style={styles.modalTitle}>Predict Score</h3>
            <div style={styles.modalMatch}>
              <span>{FLAGS[editingMatch.home]} {editingMatch.home}</span>
              <span style={{ color: "#888" }}>vs</span>
              <span>{FLAGS[editingMatch.away]} {editingMatch.away}</span>
            </div>
            <div style={styles.scoreInputRow}>
              <div style={styles.scoreInputGroup}>
                <label style={styles.scoreLabel}>{editingMatch.home}</label>
                <input
                  style={styles.scoreInput} type="number" min="0" max="20"
                  value={predForm.home} onChange={e => setPredForm(f => ({ ...f, home: e.target.value }))}
                  autoFocus
                />
              </div>
              <span style={styles.scoreDash}>–</span>
              <div style={styles.scoreInputGroup}>
                <label style={styles.scoreLabel}>{editingMatch.away}</label>
                <input
                  style={styles.scoreInput} type="number" min="0" max="20"
                  value={predForm.away} onChange={e => setPredForm(f => ({ ...f, away: e.target.value }))}
                />
              </div>
            </div>
            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setEditingMatch(null)}>Cancel</button>
              <button style={styles.saveBtn} onClick={savePrediction}>Save Prediction</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MATCHES VIEW
// ============================================================

function MatchesView({ matches, predictions, currentUser, scores }) {
  const [filter, setFilter] = useState("all");

  const played = matches.filter(m => m.result).length;
  const upcoming = matches.filter(m => !m.result).length;

  const filtered = filter === "played" ? matches.filter(m => m.result)
    : filter === "upcoming" ? matches.filter(m => !m.result)
    : matches;

  return (
    <div style={styles.view}>
      <div style={styles.viewHeader}>
        <h2 style={styles.viewTitle}><Icon name="ball" size={20} /> Matches</h2>
        <div style={styles.matchStats}>
          <span style={styles.matchStatBadge}>{played} played</span>
          <span style={styles.matchStatBadge}>{upcoming} upcoming</span>
        </div>
      </div>

      <div style={styles.filterRow}>
        {["all", "played", "upcoming"].map(f => (
          <button key={f} style={{ ...styles.filterBtn, ...(filter === f ? styles.filterActive : {}) }} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div style={styles.matchList}>
        {Object.entries(WC2026_GROUPS).map(([group]) => {
          const gMatches = filtered.filter(m => m.group === group);
          if (!gMatches.length) return null;
          return (
            <div key={group} style={styles.groupSection}>
              <h3 style={styles.groupHeader}>Group {group}</h3>
              {gMatches.map(match => {
                // build prediction row per user
                const userPred = (predictions[currentUser.id] || []).find(p => p.matchId === match.id);
                return (
                  <div key={match.id} style={styles.matchRow}>
                    <div style={styles.matchRowDate}>{match.date}</div>
                    <div style={styles.matchRowTeams}>
                      <span style={styles.matchRowTeam}>{FLAGS[match.home]} {match.home}</span>
                      {match.result
                        ? <span style={styles.matchRowScore}>{match.result.home} – {match.result.away}</span>
                        : <span style={styles.matchRowVs}>vs</span>}
                      <span style={styles.matchRowTeam}>{FLAGS[match.away]} {match.away}</span>
                    </div>
                    {userPred && (
                      <div style={styles.matchRowPred}>
                        Your pick: <strong>{userPred.home}–{userPred.away}</strong>
                        {match.result && (
                          <span style={{ ...styles.ptsBadge, marginLeft: 8, background: calcPoints(userPred, match.result) > 0 ? "#00C853" : "#444" }}>
                            +{calcPoints(userPred, match.result)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// ANALYTICS VIEW
// ============================================================

function AnalyticsView({ users, matches, predictions, scores }) {
  const played = matches.filter(m => m.result);
  const totalPredictions = Object.values(predictions).reduce((s, ps) => s + ps.length, 0);

  // Most predicted scores
  const allPreds = Object.values(predictions).flat();
  const scoreFreq = {};
  allPreds.forEach(p => {
    const k = `${p.home}-${p.away}`;
    scoreFreq[k] = (scoreFreq[k] || 0) + 1;
  });
  const topScores = Object.entries(scoreFreq).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Accuracy per user
  const ranked = [...users].map(u => {
    const s = scores[u.id] || {};
    const totalPred = (predictions[u.id] || []).length;
    const accuracy = totalPred > 0 && played.length > 0
      ? Math.round(((s.correct || 0) / Math.min(totalPred, played.length)) * 100)
      : 0;
    return { ...u, ...s, accuracy, totalPred };
  }).sort((a, b) => b.total - a.total);

  // Points over time (simulated: per match as results added)
  const matchesWithResults = matches.filter(m => m.result);

  // Agreement matrix for top 3 users
  const top3 = ranked.slice(0, 3);

  return (
    <div style={styles.view}>
      <div style={styles.viewHeader}>
        <h2 style={styles.viewTitle}><Icon name="bar" size={20} /> Analytics</h2>
      </div>

      {/* KPI row */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statNum}>{played.length}</div>
          <div style={styles.statLabel}>Results Entered</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNum}>{totalPredictions}</div>
          <div style={styles.statLabel}>Total Predictions</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNum}>{users.filter(u => u.role === "player").length}</div>
          <div style={styles.statLabel}>Active Players</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statNum, color: "#FFD700" }}>
            {Math.max(...Object.values(scores).map(s => s.total || 0))}
          </div>
          <div style={styles.statLabel}>Top Score</div>
        </div>
      </div>

      {/* Player performance table */}
      <div style={styles.analyticsSection}>
        <h3 style={styles.analyticsSectionTitle}>Player Performance</h3>
        <div style={styles.analyticsTable}>
          <div style={styles.analyticsTableHead}>
            <span style={{ flex: 2 }}>Player</span>
            <span style={{ flex: 1, textAlign: "right" }}>Predictions</span>
            <span style={{ flex: 1, textAlign: "right" }}>Correct</span>
            <span style={{ flex: 1, textAlign: "right" }}>Exact</span>
            <span style={{ flex: 1, textAlign: "right" }}>Accuracy</span>
            <span style={{ flex: 1, textAlign: "right" }}>Points</span>
          </div>
          {ranked.map((u, i) => (
            <div key={u.id} style={styles.analyticsTableRow}>
              <span style={{ flex: 2, display: "flex", alignItems: "center", gap: 8 }}>
                <span>{u.avatar}</span><span>{u.name}</span>
              </span>
              <span style={{ flex: 1, textAlign: "right", color: "#aaa" }}>{u.totalPred}</span>
              <span style={{ flex: 1, textAlign: "right" }}>{u.correct || 0}</span>
              <span style={{ flex: 1, textAlign: "right" }}>{u.exact || 0}</span>
              <span style={{ flex: 1, textAlign: "right" }}>
                <span style={{ ...styles.accuracyBadge, background: u.accuracy > 50 ? "#00C853" : u.accuracy > 25 ? "#FF9800" : "#666" }}>
                  {u.accuracy}%
                </span>
              </span>
              <span style={{ flex: 1, textAlign: "right", color: "#FFD700", fontWeight: 700 }}>{u.total || 0}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bar chart: points comparison */}
      {played.length > 0 && (
        <div style={styles.analyticsSection}>
          <h3 style={styles.analyticsSectionTitle}>Points Comparison</h3>
          <div style={styles.barChart}>
            {ranked.map(u => {
              const max = Math.max(...ranked.map(x => x.total || 0), 1);
              return (
                <div key={u.id} style={styles.barRow}>
                  <span style={styles.barLabel}>{u.avatar} {u.name}</span>
                  <div style={styles.barTrack}>
                    <div style={{ ...styles.barFill, width: `${((u.total || 0) / max) * 100}%` }} />
                  </div>
                  <span style={styles.barValue}>{u.total || 0}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Most popular predicted scores */}
      {topScores.length > 0 && (
        <div style={styles.analyticsSection}>
          <h3 style={styles.analyticsSectionTitle}>Most Popular Predicted Scorelines</h3>
          <div style={styles.popularScores}>
            {topScores.map(([score, count]) => (
              <div key={score} style={styles.popularScoreItem}>
                <span style={styles.popularScoreVal}>{score}</span>
                <div style={styles.popularScoreBar}>
                  <div style={{ ...styles.popularScoreBarFill, width: `${(count / topScores[0][1]) * 100}%` }} />
                </div>
                <span style={styles.popularScoreCount}>{count}x</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Group standings */}
      <div style={styles.analyticsSection}>
        <h3 style={styles.analyticsSectionTitle}>Group Standings (based on results)</h3>
        <div style={styles.groupStandingsGrid}>
          {Object.entries(WC2026_GROUPS).map(([group, teams]) => {
            const gMatches = matches.filter(m => m.group === group && m.result);
            const standings = teams.map(t => {
              let pts = 0, gf = 0, ga = 0, w = 0, d = 0, l = 0;
              gMatches.forEach(m => {
                if (m.home === t) {
                  gf += m.result.home; ga += m.result.away;
                  if (m.result.home > m.result.away) { pts += 3; w++; }
                  else if (m.result.home === m.result.away) { pts += 1; d++; }
                  else l++;
                } else if (m.away === t) {
                  gf += m.result.away; ga += m.result.home;
                  if (m.result.away > m.result.home) { pts += 3; w++; }
                  else if (m.result.home === m.result.away) { pts += 1; d++; }
                  else l++;
                }
              });
              return { team: t, pts, gf, ga, gd: gf - ga, w, d, l, p: w + d + l };
            }).sort((a, b) => b.pts - a.pts || b.gd - a.gd);

            return (
              <div key={group} style={styles.standingCard}>
                <h4 style={styles.standingGroupTitle}>Group {group}</h4>
                <div style={styles.standingTable}>
                  <div style={styles.standingHead}>
                    <span style={{ flex: 3 }}>Team</span>
                    <span style={{ flex: 1, textAlign: "center" }}>P</span>
                    <span style={{ flex: 1, textAlign: "center" }}>W</span>
                    <span style={{ flex: 1, textAlign: "center" }}>D</span>
                    <span style={{ flex: 1, textAlign: "center" }}>L</span>
                    <span style={{ flex: 1, textAlign: "center" }}>GD</span>
                    <span style={{ flex: 1, textAlign: "center", color: "#FFD700" }}>Pts</span>
                  </div>
                  {standings.map((s, i) => (
                    <div key={s.team} style={{ ...styles.standingRow, ...(i < 2 ? styles.standingQualify : {}) }}>
                      <span style={{ flex: 3 }}>{FLAGS[s.team]} {s.team}</span>
                      <span style={{ flex: 1, textAlign: "center", color: "#aaa" }}>{s.p}</span>
                      <span style={{ flex: 1, textAlign: "center" }}>{s.w}</span>
                      <span style={{ flex: 1, textAlign: "center" }}>{s.d}</span>
                      <span style={{ flex: 1, textAlign: "center" }}>{s.l}</span>
                      <span style={{ flex: 1, textAlign: "center", color: s.gd >= 0 ? "#4CAF50" : "#f44336" }}>{s.gd > 0 ? "+" : ""}{s.gd}</span>
                      <span style={{ flex: 1, textAlign: "center", fontWeight: 700, color: "#FFD700" }}>{s.pts}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ADMIN: USERS
// ============================================================

function AdminUsersView({ users, setUsers, notify }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "player", avatar: "⚽" });

  const avatarOptions = ["⚽", "🏆", "🌟", "🔥", "💎", "🎯", "⚡", "🦁", "🐯", "🦅"];

  const addUser = () => {
    if (!form.name || !form.email || !form.password) { notify("All fields required", "error"); return; }
    if (users.find(u => u.email === form.email)) { notify("Email already exists", "error"); return; }
    const newUser = { ...form, id: Date.now(), joined: new Date().toISOString().split("T")[0] };
    setUsers(prev => [...prev, newUser]);
    setShowAdd(false);
    setForm({ name: "", email: "", password: "", role: "player", avatar: "⚽" });
    notify(`User ${newUser.name} added!`);
  };

  const toggleRole = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: u.role === "admin" ? "player" : "admin" } : u));
    notify("Role updated");
  };

  const removeUser = (id) => {
    if (users.find(u => u.id === id)?.role === "admin" && users.filter(u => u.role === "admin").length === 1) {
      notify("Cannot remove last admin", "error"); return;
    }
    setUsers(prev => prev.filter(u => u.id !== id));
    notify("User removed");
  };

  return (
    <div style={styles.view}>
      <div style={styles.viewHeader}>
        <h2 style={styles.viewTitle}><Icon name="users" size={20} /> User Management</h2>
        <button style={styles.primaryBtn} onClick={() => setShowAdd(!showAdd)}>
          <Icon name="plus" size={14} /> Add User
        </button>
      </div>

      {showAdd && (
        <div style={styles.adminForm}>
          <h3 style={styles.adminFormTitle}>New User</h3>
          <div style={styles.formGrid}>
            <input style={styles.input} placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <input style={styles.input} type="email" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            <input style={styles.input} type="password" placeholder="Password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            <select style={styles.select} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              <option value="player">Player</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div style={styles.avatarPicker}>
            {avatarOptions.map(a => (
              <button key={a} style={{ ...styles.avatarOption, ...(form.avatar === a ? styles.avatarOptionActive : {}) }} onClick={() => setForm(f => ({ ...f, avatar: a }))}>
                {a}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button style={styles.cancelBtn} onClick={() => setShowAdd(false)}>Cancel</button>
            <button style={styles.saveBtn} onClick={addUser}>Add User</button>
          </div>
        </div>
      )}

      <div style={styles.userList}>
        {users.map(u => (
          <div key={u.id} style={styles.userRow}>
            <span style={styles.userAvatar}>{u.avatar}</span>
            <div style={styles.userInfo}>
              <span style={styles.userInfoName}>{u.name}</span>
              <span style={styles.userInfoEmail}>{u.email}</span>
            </div>
            <span style={{ ...styles.roleBadge, background: u.role === "admin" ? "#FFD700" : "#333", color: u.role === "admin" ? "#000" : "#aaa" }}>
              {u.role}
            </span>
            <span style={styles.userJoined}>Joined {u.joined}</span>
            <div style={styles.userActions}>
              <button style={styles.actionBtn} onClick={() => toggleRole(u.id)} title="Toggle role">
                <Icon name="crown" size={14} />
              </button>
              <button style={{ ...styles.actionBtn, color: "#f44336" }} onClick={() => removeUser(u.id)} title="Remove user">
                <Icon name="trash" size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// ADMIN: RESULTS
// ============================================================

function AdminResultsView({ matches, setMatches, notify }) {
  const [selected, setSelected] = useState(null);
  const [resultForm, setResultForm] = useState({ home: "", away: "" });
  const [filterGroup, setFilterGroup] = useState("all");

  const filtered = filterGroup === "all" ? matches : matches.filter(m => m.group === filterGroup);

  const saveResult = () => {
    const h = parseInt(resultForm.home), a = parseInt(resultForm.away);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) { notify("Enter valid scores", "error"); return; }
    setMatches(prev => prev.map(m => m.id === selected.id ? { ...m, result: { home: h, away: a } } : m));
    setSelected(null);
    notify(`Result saved: ${selected.home} ${h}–${a} ${selected.away}`);
  };

  const clearResult = (matchId) => {
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, result: null } : m));
    notify("Result cleared");
  };

  return (
    <div style={styles.view}>
      <div style={styles.viewHeader}>
        <h2 style={styles.viewTitle}><Icon name="edit" size={20} /> Enter Results</h2>
        <div style={{ color: "#888", fontSize: 13 }}>
          {matches.filter(m => m.result).length}/{matches.length} results entered
        </div>
      </div>

      <div style={styles.filterRow}>
        <button style={{ ...styles.filterBtn, ...(filterGroup === "all" ? styles.filterActive : {}) }} onClick={() => setFilterGroup("all")}>All</button>
        {Object.keys(WC2026_GROUPS).map(g => (
          <button key={g} style={{ ...styles.filterBtn, ...(filterGroup === g ? styles.filterActive : {}) }} onClick={() => setFilterGroup(g)}>
            Group {g}
          </button>
        ))}
      </div>

      <div style={styles.resultsList}>
        {Object.entries(WC2026_GROUPS).map(([group]) => {
          const gMatches = filtered.filter(m => m.group === group);
          if (!gMatches.length) return null;
          return (
            <div key={group} style={styles.groupSection}>
              <h3 style={styles.groupHeader}>Group {group}</h3>
              {gMatches.map(match => (
                <div key={match.id} style={styles.resultRow}>
                  <span style={styles.resultDate}>{match.date}</span>
                  <div style={styles.resultTeams}>
                    <span>{FLAGS[match.home]} {match.home}</span>
                    {match.result
                      ? <span style={styles.resultScore}>{match.result.home} – {match.result.away}</span>
                      : <span style={{ color: "#666", fontSize: 13 }}>not played</span>}
                    <span>{FLAGS[match.away]} {match.away}</span>
                  </div>
                  <div style={styles.resultActions}>
                    <button style={styles.primaryBtn} onClick={() => { setSelected(match); setResultForm(match.result ? { home: match.result.home, away: match.result.away } : { home: "", away: "" }); }}>
                      {match.result ? <><Icon name="edit" size={12} /> Edit</> : <><Icon name="plus" size={12} /> Enter</>}
                    </button>
                    {match.result && (
                      <button style={{ ...styles.actionBtn, color: "#f44336" }} onClick={() => clearResult(match.id)}>
                        <Icon name="x" size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {selected && (
        <div style={styles.modal}>
          <div style={styles.modalCard}>
            <h3 style={styles.modalTitle}>Enter Result</h3>
            <div style={styles.modalMatch}>
              <span>{FLAGS[selected.home]} {selected.home}</span>
              <span style={{ color: "#888" }}>vs</span>
              <span>{FLAGS[selected.away]} {selected.away}</span>
            </div>
            <div style={styles.scoreInputRow}>
              <div style={styles.scoreInputGroup}>
                <label style={styles.scoreLabel}>{selected.home}</label>
                <input style={styles.scoreInput} type="number" min="0" max="20" value={resultForm.home} onChange={e => setResultForm(f => ({ ...f, home: e.target.value }))} autoFocus />
              </div>
              <span style={styles.scoreDash}>–</span>
              <div style={styles.scoreInputGroup}>
                <label style={styles.scoreLabel}>{selected.away}</label>
                <input style={styles.scoreInput} type="number" min="0" max="20" value={resultForm.away} onChange={e => setResultForm(f => ({ ...f, away: e.target.value }))} />
              </div>
            </div>
            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setSelected(null)}>Cancel</button>
              <button style={styles.saveBtn} onClick={saveResult}>Save Result</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// ADMIN: APP SETTINGS
// ============================================================

function AdminAppView({ matches, setMatches, users, predictions, setPredictions, notify }) {
  const [confirmReset, setConfirmReset] = useState(false);

  const stats = {
    totalMatches: matches.length,
    resultsEntered: matches.filter(m => m.result).length,
    totalPredictions: Object.values(predictions).reduce((s, ps) => s + ps.length, 0),
    coverage: Math.round((Object.values(predictions).reduce((s, ps) => s + ps.length, 0) / (users.length * matches.length)) * 100),
  };

  const resetAllResults = () => {
    setMatches(prev => prev.map(m => ({ ...m, result: null })));
    setConfirmReset(false);
    notify("All results cleared");
  };

  const resetAllPredictions = () => {
    setPredictions({});
    notify("All predictions cleared");
  };

  const exportData = () => {
    const data = { matches, predictions, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "wc2026_data.json"; a.click();
    notify("Data exported!");
  };

  return (
    <div style={styles.view}>
      <div style={styles.viewHeader}>
        <h2 style={styles.viewTitle}><Icon name="settings" size={20} /> App Administration</h2>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}><div style={styles.statNum}>{stats.totalMatches}</div><div style={styles.statLabel}>Total Matches</div></div>
        <div style={styles.statCard}><div style={styles.statNum}>{stats.resultsEntered}</div><div style={styles.statLabel}>Results Entered</div></div>
        <div style={styles.statCard}><div style={styles.statNum}>{stats.totalPredictions}</div><div style={styles.statLabel}>Total Predictions</div></div>
        <div style={styles.statCard}><div style={{ ...styles.statNum, color: "#4CAF50" }}>{stats.coverage}%</div><div style={styles.statLabel}>Prediction Coverage</div></div>
      </div>

      {/* Scoring rules display */}
      <div style={styles.adminSection}>
        <h3 style={styles.adminSectionTitle}>Scoring Rules</h3>
        <div style={styles.scoringGrid}>
          {Object.entries(SCORING_RULES).map(([rule, pts]) => (
            <div key={rule} style={styles.ruleRow}>
              <span style={styles.ruleName}>{rule.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
              <span style={styles.rulePts}>+{pts} pts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div style={{ ...styles.adminSection, border: "1px solid #FF1744" }}>
        <h3 style={{ ...styles.adminSectionTitle, color: "#FF1744" }}>⚠️ Danger Zone</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={styles.dangerRow}>
            <div>
              <div style={styles.dangerTitle}>Clear All Results</div>
              <div style={styles.dangerDesc}>Removes all match results. Points will recalculate to 0.</div>
            </div>
            {confirmReset
              ? <div style={{ display: "flex", gap: 8 }}>
                  <button style={styles.cancelBtn} onClick={() => setConfirmReset(false)}>Cancel</button>
                  <button style={styles.dangerBtn} onClick={resetAllResults}>Confirm</button>
                </div>
              : <button style={styles.dangerBtn} onClick={() => setConfirmReset(true)}>Clear Results</button>}
          </div>
          <div style={styles.dangerRow}>
            <div>
              <div style={styles.dangerTitle}>Clear All Predictions</div>
              <div style={styles.dangerDesc}>Removes all player predictions permanently.</div>
            </div>
            <button style={styles.dangerBtn} onClick={resetAllPredictions}>Clear Predictions</button>
          </div>
          <div style={styles.dangerRow}>
            <div>
              <div style={styles.dangerTitle}>Export Data</div>
              <div style={styles.dangerDesc}>Download all matches and predictions as JSON.</div>
            </div>
            <button style={styles.primaryBtn} onClick={exportData}>Export JSON</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// STYLES
// ============================================================

const C = {
  bg: "#0a0a0f",
  surface: "#13131a",
  surface2: "#1c1c26",
  border: "#252535",
  accent: "#00E5FF",
  accentDim: "#00B8CC",
  gold: "#FFD700",
  text: "#E8E8F0",
  textDim: "#888899",
  success: "#00C853",
  danger: "#FF1744",
  warning: "#FF9800",
};

const styles = {
  app: { minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans', 'Segoe UI', sans-serif", position: "relative" },
  bg: { position: "fixed", inset: 0, background: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,229,255,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(255,215,0,0.04) 0%, transparent 50%)`, pointerEvents: "none", zIndex: 0 },

  header: { position: "sticky", top: 0, zIndex: 100, background: "rgba(13,13,20,0.95)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 16, padding: "10px 20px", flexWrap: "wrap" },
  headerLeft: { display: "flex", alignItems: "baseline", gap: 8, marginRight: 8 },
  logo: { fontSize: 18, fontWeight: 800, color: C.accent, letterSpacing: -0.5 },
  logoSub: { fontSize: 10, color: C.textDim, textTransform: "uppercase", letterSpacing: 2 },
  nav: { display: "flex", gap: 4, flex: 1, flexWrap: "wrap" },
  navBtn: { display: "flex", alignItems: "center", gap: 5, padding: "6px 11px", borderRadius: 6, border: "none", background: "transparent", color: C.textDim, cursor: "pointer", fontSize: 12, fontWeight: 500, transition: "all 0.15s" },
  navBtnActive: { background: `rgba(0,229,255,0.1)`, color: C.accent, borderBottom: `2px solid ${C.accent}` },
  navLabel: { fontSize: 12 },
  userBadge: { display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" },
  avatar: { fontSize: 20 },
  userName: { fontSize: 13, fontWeight: 600 },
  adminBadge: { fontSize: 9, fontWeight: 700, padding: "2px 5px", borderRadius: 3, background: C.gold, color: "#000", letterSpacing: 0.5 },
  logoutBtn: { background: "none", border: "none", color: C.textDim, cursor: "pointer", padding: 4 },

  notification: { position: "fixed", top: 20, right: 20, zIndex: 9999, padding: "10px 16px", borderRadius: 8, color: "#fff", display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.4)", animation: "fadeIn 0.2s" },

  main: { padding: "24px 20px", maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 },

  view: { display: "flex", flexDirection: "column", gap: 20 },
  viewHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  viewTitle: { display: "flex", alignItems: "center", gap: 8, fontSize: 22, fontWeight: 700, margin: 0, color: C.text },

  // Login
  loginPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" },
  loginCard: { position: "relative", zIndex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "40px 36px", width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" },
  loginBadge: { fontSize: 10, letterSpacing: 3, color: C.accentDim, textTransform: "uppercase", marginBottom: 16 },
  loginTitle: { fontSize: 42, fontWeight: 800, lineHeight: 1.1, margin: "0 0 8px", color: C.text },
  loginSub: { fontSize: 14, color: C.textDim, marginBottom: 28 },
  loginForm: { display: "flex", flexDirection: "column", gap: 10 },
  loginError: { color: C.danger, fontSize: 12, margin: "4px 0 0" },
  loginBtn: { padding: "12px", background: C.accent, color: "#000", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", marginTop: 4 },
  loginHint: {},

  // Input
  input: { padding: "10px 12px", background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" },
  select: { padding: "10px 12px", background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, outline: "none", width: "100%", cursor: "pointer" },

  // Leaderboard
  matchProgress: { display: "flex", alignItems: "center", gap: 10 },
  progressLabel: { fontSize: 12, color: C.textDim, whiteSpace: "nowrap" },
  progressBar: { width: 120, height: 6, background: C.border, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", background: `linear-gradient(90deg, ${C.accent}, ${C.gold})`, borderRadius: 3, transition: "width 0.5s" },

  podium: { display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" },
  podiumCard: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px", textAlign: "center", minWidth: 140, flex: 1, maxWidth: 180 },
  podiumFirst: { border: `1px solid ${C.gold}`, boxShadow: `0 0 20px rgba(255,215,0,0.15)` },
  medal: { fontSize: 28, marginBottom: 8 },
  podiumAvatar: { fontSize: 32, marginBottom: 6 },
  podiumName: { fontSize: 14, fontWeight: 600, marginBottom: 4 },
  podiumScore: { fontSize: 32, fontWeight: 800, color: C.gold },
  podiumPts: { fontSize: 11, color: C.textDim, marginBottom: 8 },
  podiumStats: { display: "flex", gap: 8, justifyContent: "center", fontSize: 11, color: C.textDim },

  leaderTable: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" },
  tableHead: { display: "flex", padding: "10px 16px", borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.textDim, textTransform: "uppercase", letterSpacing: 1 },
  thRank: { width: 32 },
  thPlayer: { flex: 1 },
  thNum: { width: 80, textAlign: "right" },
  thPts: { width: 80, textAlign: "right", color: C.gold },
  tableRow: { display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid ${C.border}`, fontSize: 14, transition: "background 0.1s" },
  tableRowTop: { background: `rgba(255,215,0,0.03)` },
  tdRank: { width: 32, color: C.textDim, fontSize: 12 },
  tdPlayer: { flex: 1, display: "flex", alignItems: "center", gap: 10 },
  tdNum: { width: 80, textAlign: "right", color: C.textDim },
  tdPts: { width: 80, textAlign: "right", fontWeight: 700, color: C.gold },

  scoringCard: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 },
  scoringTitle: { display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: C.textDim, margin: "0 0 12px" },
  scoringGrid: { display: "flex", flexWrap: "wrap", gap: 8 },
  scoringItem: { display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.textDim },
  scoringPts: { fontWeight: 700, color: C.success, minWidth: 28 },

  // Stats row
  statsRow: { display: "flex", gap: 10, flexWrap: "wrap" },
  statCard: { flex: 1, minWidth: 100, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", textAlign: "center" },
  statNum: { fontSize: 28, fontWeight: 800, color: C.text, lineHeight: 1 },
  statLabel: { fontSize: 11, color: C.textDim, marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 },

  // Filter
  filterRow: { display: "flex", gap: 6, flexWrap: "wrap" },
  filterBtn: { padding: "5px 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.textDim, cursor: "pointer", fontSize: 12 },
  filterActive: { background: `rgba(0,229,255,0.1)`, border: `1px solid ${C.accent}`, color: C.accent },

  // Group section
  groupSection: { marginBottom: 8 },
  groupHeader: { fontSize: 12, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: 2, margin: "0 0 10px", borderBottom: `1px solid ${C.border}`, paddingBottom: 6 },

  // Match cards (predictions view)
  matchGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 },
  matchCard: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 },
  matchCardPlayed: { opacity: 0.85 },
  matchDate: { fontSize: 10, color: C.textDim, textTransform: "uppercase", letterSpacing: 0.5 },
  matchTeams: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4, fontSize: 12 },
  teamName: { fontSize: 11, flex: 1 },
  vs: { fontSize: 10, color: C.textDim, padding: "0 4px" },
  predDisplay: { display: "flex", alignItems: "center", gap: 8 },
  predScore: { fontWeight: 700, fontSize: 16, color: C.accent },
  ptsBadge: { padding: "2px 6px", borderRadius: 4, fontSize: 11, fontWeight: 700, color: "#fff" },
  editPredBtn: { display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 4, border: `1px solid ${C.border}`, background: "transparent", color: C.textDim, cursor: "pointer", fontSize: 11, marginLeft: "auto" },
  predictBtn: { padding: "6px 12px", background: `rgba(0,229,255,0.1)`, border: `1px solid ${C.accent}`, borderRadius: 6, color: C.accent, cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 },
  actualResult: { fontSize: 11, color: C.textDim },

  // Modal
  modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" },
  modalCard: { background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 16, padding: "28px 32px", width: "100%", maxWidth: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" },
  modalTitle: { fontSize: 18, fontWeight: 700, margin: "0 0 16px" },
  modalMatch: { display: "flex", gap: 12, alignItems: "center", justifyContent: "center", fontSize: 14, marginBottom: 20, flexWrap: "wrap" },
  scoreInputRow: { display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 12, marginBottom: 20 },
  scoreInputGroup: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6 },
  scoreLabel: { fontSize: 11, color: C.textDim, textAlign: "center" },
  scoreInput: { width: 64, padding: "10px", background: C.bg, border: `2px solid ${C.accent}`, borderRadius: 8, color: C.text, fontSize: 22, fontWeight: 700, textAlign: "center", outline: "none" },
  scoreDash: { fontSize: 24, color: C.textDim, paddingBottom: 8 },
  modalActions: { display: "flex", gap: 10 },

  // Buttons
  primaryBtn: { display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", background: `rgba(0,229,255,0.1)`, border: `1px solid ${C.accent}`, borderRadius: 7, color: C.accent, cursor: "pointer", fontSize: 12, fontWeight: 600 },
  saveBtn: { flex: 1, padding: "10px", background: C.accent, color: "#000", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" },
  cancelBtn: { flex: 1, padding: "10px", background: "transparent", color: C.textDim, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, cursor: "pointer" },
  dangerBtn: { padding: "8px 14px", background: "rgba(255,23,68,0.1)", border: `1px solid ${C.danger}`, borderRadius: 7, color: C.danger, cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" },
  actionBtn: { background: "none", border: "none", color: C.textDim, cursor: "pointer", padding: 5, borderRadius: 4 },

  // Match row (matches view)
  matchList: { display: "flex", flexDirection: "column", gap: 0 },
  matchRow: { display: "flex", alignItems: "center", padding: "10px 14px", borderBottom: `1px solid ${C.border}`, flexWrap: "wrap", gap: 8 },
  matchRowDate: { width: 80, fontSize: 11, color: C.textDim },
  matchRowTeams: { flex: 1, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  matchRowTeam: { fontSize: 13 },
  matchRowScore: { fontWeight: 700, fontSize: 16, color: C.accent, padding: "0 8px" },
  matchRowVs: { fontSize: 12, color: C.textDim, padding: "0 8px" },
  matchRowPred: { fontSize: 12, color: C.textDim },
  matchStats: { display: "flex", gap: 8 },
  matchStatBadge: { padding: "4px 10px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, fontSize: 11, color: C.textDim },

  // Admin forms
  adminForm: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 },
  adminFormTitle: { fontSize: 15, fontWeight: 600, margin: "0 0 14px" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 },
  avatarPicker: { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 },
  avatarOption: { width: 36, height: 36, borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", fontSize: 18, cursor: "pointer" },
  avatarOptionActive: { border: `2px solid ${C.accent}`, background: `rgba(0,229,255,0.1)` },

  userList: { display: "flex", flexDirection: "column", gap: 8 },
  userRow: { display: "flex", alignItems: "center", gap: 12, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px", flexWrap: "wrap" },
  userAvatar: { fontSize: 28 },
  userInfo: { display: "flex", flexDirection: "column", gap: 2, flex: 1 },
  userInfoName: { fontSize: 14, fontWeight: 600 },
  userInfoEmail: { fontSize: 12, color: C.textDim },
  roleBadge: { padding: "3px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" },
  userJoined: { fontSize: 11, color: C.textDim },
  userActions: { display: "flex", gap: 4 },

  // Result rows
  resultsList: {},
  resultRow: { display: "flex", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}`, gap: 12, flexWrap: "wrap" },
  resultDate: { width: 80, fontSize: 11, color: C.textDim },
  resultTeams: { flex: 1, display: "flex", alignItems: "center", gap: 10, fontSize: 13 },
  resultScore: { fontWeight: 700, fontSize: 18, color: C.success, padding: "0 8px" },
  resultActions: { display: "flex", gap: 6 },

  // Admin sections
  adminSection: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 },
  adminSectionTitle: { fontSize: 14, fontWeight: 600, margin: "0 0 14px", color: C.text },
  ruleRow: { display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 },
  ruleName: { color: C.textDim, textTransform: "capitalize" },
  rulePts: { color: C.success, fontWeight: 700 },
  dangerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "10px 0", borderBottom: `1px solid rgba(255,23,68,0.1)` },
  dangerTitle: { fontSize: 13, fontWeight: 600, color: C.danger, marginBottom: 2 },
  dangerDesc: { fontSize: 11, color: C.textDim },

  // Analytics
  analyticsSection: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 },
  analyticsSectionTitle: { fontSize: 14, fontWeight: 600, margin: "0 0 14px" },
  analyticsTable: { display: "flex", flexDirection: "column" },
  analyticsTableHead: { display: "flex", padding: "6px 0", borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.textDim, textTransform: "uppercase", letterSpacing: 0.5, gap: 8 },
  analyticsTableRow: { display: "flex", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13, gap: 8 },
  accuracyBadge: { padding: "2px 6px", borderRadius: 4, fontSize: 11, fontWeight: 700, color: "#fff" },

  barChart: { display: "flex", flexDirection: "column", gap: 10 },
  barRow: { display: "flex", alignItems: "center", gap: 10 },
  barLabel: { width: 140, fontSize: 12, color: C.textDim, textAlign: "right" },
  barTrack: { flex: 1, height: 20, background: C.border, borderRadius: 4, overflow: "hidden" },
  barFill: { height: "100%", background: `linear-gradient(90deg, ${C.accent}, ${C.gold})`, borderRadius: 4, transition: "width 0.5s" },
  barValue: { width: 36, fontSize: 13, fontWeight: 700, color: C.gold, textAlign: "right" },

  popularScores: { display: "flex", flexDirection: "column", gap: 8 },
  popularScoreItem: { display: "flex", alignItems: "center", gap: 10 },
  popularScoreVal: { width: 50, fontWeight: 700, fontSize: 14, color: C.accent },
  popularScoreBar: { flex: 1, height: 16, background: C.border, borderRadius: 4, overflow: "hidden" },
  popularScoreBarFill: { height: "100%", background: `rgba(0,229,255,0.3)`, borderRadius: 4 },
  popularScoreCount: { width: 28, fontSize: 12, color: C.textDim },

  groupStandingsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 },
  standingCard: { background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14 },
  standingGroupTitle: { fontSize: 12, fontWeight: 700, color: C.accent, margin: "0 0 10px", textTransform: "uppercase", letterSpacing: 1 },
  standingTable: {},
  standingHead: { display: "flex", fontSize: 10, color: C.textDim, paddingBottom: 6, borderBottom: `1px solid ${C.border}`, textTransform: "uppercase" },
  standingRow: { display: "flex", alignItems: "center", padding: "5px 0", fontSize: 11, borderBottom: `1px solid rgba(255,255,255,0.04)` },
  standingQualify: { background: `rgba(0,229,255,0.04)` },
};
