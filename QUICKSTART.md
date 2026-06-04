# World Cup 2026 Prediction Game - Quick Start Guide

## ✅ What's Been Created

Your World Cup 2026 prediction game is now fully built with both frontend and backend! Here's what you have:

### 📱 Frontend (React + Vite) - DEPLOYED ✨
- **Published to**: https://ssjp8.github.io/wc2026/
- **Features**:
  - User registration and login
  - Dashboard with game statistics
  - Make and update predictions
  - Leaderboard ranking
  - Analytics and insights
  - Admin panel for game management

### 🖥️ Backend (Node.js + Express) - READY TO DEPLOY
- **Complete API** with all endpoints
- **Database** (SQLite with automatic migrations)
- **Authentication** (JWT with role-based access)
- **Automated tasks** (cron jobs for match fetching)
- **World Cup data integration** (football-data.org API)

---

## 🚀 Getting Started Locally (5 minutes)

### Step 1: Install Dependencies
```bash
npm install
cd server && npm install && cd ..
```

### Step 2: Start Backend
```bash
npm run server
# Backend runs on http://localhost:5000
```

### Step 3: Start Frontend (new terminal)
```bash
npm run dev
# Frontend runs on http://localhost:5173
```

### Step 4: Seed Database (optional, first time)
```bash
npm run server:seed
# Creates admin account: username=admin, password=admin123
```

### Step 5: Open in Browser
Go to http://localhost:5173 and start using the app!

---

## 📋 Features Overview

### User Access Administration
- ✅ Register new users
- ✅ Login with authentication
- ✅ Admin can manage users
- ✅ Role-based permissions (user/admin)

### Application Administration
- ✅ Admin panel accessible
- ✅ Create matches
- ✅ Update match results
- ✅ Manage users
- ✅ Recalculate points

### Entering a Prediction
- ✅ View upcoming matches
- ✅ Enter score predictions
- ✅ Simple number inputs (0-15 goals)
- ✅ Real-time feedback

### Updating a Prediction
- ✅ Update predictions before match kickoff
- ✅ Cannot update after match starts
- ✅ Delete predictions if needed

### Adding Match Results
- ✅ Admin can add final scores
- ✅ Automatic point calculation
- ✅ User rankings update instantly
- ✅ Can recalculate all points if needed

### Calculating Points
- ✅ 5 points for exact score
- ✅ 3 points for correct result
- ✅ 0 points for wrong prediction
- ✅ Automatic calculation when results added

### Displaying Points
- ✅ User dashboard shows personal stats
- ✅ Leaderboard with rankings
- ✅ Points breakdown per match
- ✅ Accuracy statistics

### Analytics
- ✅ Game statistics (users, matches, predictions)
- ✅ Prediction accuracy by user
- ✅ Most popular predictions
- ✅ Performance insights

---

## 🌍 Automated World Cup Results (Optional)

To enable automatic match result fetching:

1. **Get API Key** (free):
   - Go to https://www.football-data.org/
   - Sign up for free account
   - Copy your API key

2. **Add to Backend**:
   ```bash
   # Edit server/.env
   FOOTBALL_API_KEY=your_api_key_here
   ```

3. **Automatic Updates**:
   - Server checks every 6 hours
   - Fetches match results automatically
   - Updates predictions and points
   - No manual intervention needed

---

## 🌐 Deploy Backend (Choose One)

### Option A: Vercel (Easiest)
1. Go to https://vercel.com
2. Import GitHub repo
3. Set root directory: `server/`
4. Add environment variables
5. Click Deploy ✨

👉 See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed steps

### Option B: Render
1. Go to https://render.com
2. Create new Web Service
3. Connect GitHub repo
4. Configure start command: `npm start`
5. Add environment variables

👉 See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed steps

### Option C: Self-Hosted VPS
Deploy to DigitalOcean, AWS, or any VPS with PM2

👉 See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed steps

---

## 🔧 Configuration

### Backend Environment Variables

```env
# Core
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_key

# Database
DATABASE_URL=./data/wc2026.db

# Frontend Connection
FRONTEND_URL=http://localhost:5173

# World Cup Data (Optional)
FOOTBALL_API_KEY=your_api_key
FOOTBALL_API_BASE_URL=https://api.football-data.org/v4
```

### Frontend Environment Variables

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📚 API Endpoints

All endpoints require JWT token in Authorization header:
```
Authorization: Bearer your_token_here
```

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login

### Matches
- `GET /api/matches` - List matches
- `POST /api/admin/matches` - Create match
- `PATCH /api/matches/:id/result` - Add result

### Predictions
- `GET /api/predictions/user` - Your predictions
- `POST /api/predictions/:matchId` - Make prediction
- `DELETE /api/predictions/:id` - Delete prediction

### Points & Rankings
- `GET /api/points/leaderboard` - Top players
- `GET /api/points/user` - Your score
- `GET /api/points/breakdown` - Score details

### Analytics
- `GET /api/analytics/stats` - Game stats
- `GET /api/analytics/accuracy` - Accuracy stats
- `GET /api/analytics/popular-predictions` - Popular picks

### Admin
- `DELETE /api/admin/users/:id` - Remove user
- `POST /api/admin/recalculate-points` - Recalculate

---

## 🧪 Testing

### Test as Regular User
```
Username: player1
Password: password123
```

### Test as Admin
```
Username: admin
Password: admin123
```

### Create Test Match
1. Login as admin
2. Go to Admin > Manage Matches
3. Click "Create New Match"
4. Fill in teams, date, stage
5. Click Create

### Add Test Results
1. Go to Admin > Update Match Result
2. Enter Match ID
3. Enter final scores
4. Watch points calculate automatically!

---

## 📞 Support & Troubleshooting

### Backend won't start?
```bash
# Check dependencies
cd server && npm install

# Check .env file
cat server/.env

# Check port availability
lsof -i :5000
```

### Database errors?
```bash
# Reset database (will lose data)
rm server/data/wc2026.db

# Restart server (auto-creates new DB)
npm run server

# Re-seed if needed
npm run server:seed
```

### API calls failing?
- Make sure backend is running on port 5000
- Check browser console for error messages
- Verify JWT token is valid
- Check CORS settings in backend

### Build fails?
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

---

## 📊 Database Structure

| Table | Purpose |
|-------|---------|
| `users` | User accounts, authentication |
| `matches` | World Cup matches |
| `predictions` | User predictions |
| `user_points` | Scores and rankings |

All data automatically created on first run!

---

## 🎯 Next Steps

1. ✅ **Frontend is deployed!** Visit: https://ssjp8.github.io/wc2026/

2. **Deploy backend** (choose from options above)

3. **Get World Cup data**:
   - Optional: Sign up for football-data.org API key
   - Or manually add matches via admin panel

4. **Customize** (optional):
   - Update styling in `src/App.css`
   - Modify points system in backend
   - Add more analytics

5. **Invite players**:
   - Share https://ssjp8.github.io/wc2026/
   - Have them register
   - Start predicting!

---

## 📝 Files Overview

```
wc2026/
├── Frontend (React)
│   ├── src/App.jsx              Main component
│   ├── src/App.css              Styling
│   ├── src/pages/               Page components
│   ├── src/services/api.js      API client
│   ├── package.json             Dependencies
│   └── vite.config.js           Build config
│
├── Backend (Node.js)
│   ├── server/src/index.js      Main server
│   ├── server/src/db/           Database
│   ├── server/src/routes/       API routes
│   ├── server/src/services/     Business logic
│   ├── server/src/middleware/   Auth & errors
│   └── server/.env              Configuration
│
├── DEPLOYMENT.md                Deploy guide
├── README.md                    Full documentation
└── This file                    Quick start guide
```

---

## 🏆 You're All Set!

Your World Cup 2026 prediction game is ready to go. The frontend is live at https://ssjp8.github.io/wc2026/, and the backend is ready to deploy.

**Choose your backend deployment option from the [DEPLOYMENT.md](./DEPLOYMENT.md) file and you're done!**

Enjoy the game! ⚽🎉
