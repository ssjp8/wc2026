# World Cup 2026 Prediction Game

A multi-user web application for predicting World Cup 2026 match results, tracking points, and competing on the leaderboard.

## Features

✨ **User Management**
- User registration and login
- Role-based access (user/admin)
- User administration (admin only)

🎯 **Prediction System**
- Enter predictions for upcoming matches
- Update predictions before match kickoff
- View prediction history

📊 **Points & Scoring**
- 5 points for exact score prediction
- 3 points for correct result (win/draw/loss)
- Automatic recalculation of points when results are added

🏆 **Leaderboard**
- Real-time leaderboard ranking
- View user rankings and total points

📈 **Analytics**
- Prediction accuracy statistics
- Most popular predictions
- Game statistics and insights

⚙️ **Admin Features**
- Add World Cup matches
- Input match results
- Manage users
- Recalculate points

🔄 **Automated Match Updates**
- Automatic fetching of World Cup 2026 results
- Scheduled updates (every 6 hours)
- Automatic point calculation

## Tech Stack

### Frontend
- React 19
- Vite
- Axios for API calls
- CSS3 with responsive design

### Backend
- Node.js + Express
- SQLite3 database
- JWT authentication
- Bcrypt for password hashing
- node-cron for scheduled tasks
- Axios for external API integration

## Project Structure

```
wc2026/
├── src/                    # Frontend React app
│   ├── pages/             # Dashboard, Predictions, Leaderboard, Admin, Analytics
│   ├── services/          # API client
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── server/                 # Backend Express server
│   ├── src/
│   │   ├── db/            # Database initialization & migrations
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic & cron jobs
│   │   ├── middleware/    # Auth & error handling
│   │   └── index.js       # Server entry point
│   ├── data/              # SQLite database
│   └── package.json
├── package.json           # Frontend dependencies
├── vite.config.js
└── index.html
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ssjp8/wc2026.git
   cd wc2026
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Set up environment variables**
   ```bash
   # Copy the example env file
   cp server/.env.example server/.env
   
   # Edit server/.env and add your API key for football-data.org
   # FOOTBALL_API_KEY=your_api_key_here
   ```

### Development

**Start the backend server**
```bash
npm run server
# Runs on http://localhost:5000
```

**In a new terminal, start the frontend dev server**
```bash
npm run dev
# Runs on http://localhost:5173
```

**Seed the database with an admin user**
```bash
npm run server:seed
# Creates admin user (username: admin, password: admin123)
```

### Production Deployment

#### Frontend (GitHub Pages)
```bash
npm run deploy
# Automatically builds and deploys to https://ssjp8.github.io/wc2026/
```

#### Backend (Vercel or Render)

**For Vercel:**
1. Create a Vercel account and connect your GitHub repository
2. Set the root directory to `server/`
3. Add environment variables in Vercel dashboard
4. Deploy

**For Render:**
1. Create a Render account
2. Create a new Web Service connected to your GitHub repo
3. Set the start command to `cd server && npm start`
4. Add environment variables
5. Deploy

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/profile` - Get current user profile
- `GET /api/users` - Get all users (admin only)
- `PATCH /api/users/:userId/role` - Update user role (admin only)

### Matches
- `GET /api/matches` - Get all matches
- `GET /api/matches/:matchId` - Get single match
- `POST /api/admin/matches` - Create match (admin only)
- `PATCH /api/matches/:matchId/result` - Update match result (admin only)

### Predictions
- `GET /api/predictions/user` - Get user's predictions
- `GET /api/predictions/match/:matchId` - Get predictions for a match
- `POST /api/predictions/:matchId` - Make/update prediction
- `DELETE /api/predictions/:predictionId` - Delete prediction

### Points
- `GET /api/points/leaderboard` - Get leaderboard
- `GET /api/points/user` - Get user's points
- `GET /api/points/breakdown` - Get detailed points breakdown

### Analytics
- `GET /api/analytics/stats` - Get game statistics
- `GET /api/analytics/accuracy` - Get prediction accuracy
- `GET /api/analytics/popular-predictions` - Get popular predictions

### Admin
- `DELETE /api/admin/users/:userId` - Delete user (admin only)
- `POST /api/admin/recalculate-points` - Recalculate all points (admin only)

## Points System

- **Exact Score**: 5 points
  - Example: Predicted 2-1, Actual 2-1
  
- **Correct Result**: 3 points
  - Predicted home win & actual home win
  - Predicted away win & actual away win
  - Predicted draw & actual draw

- **Wrong Prediction**: 0 points

## World Cup Data Integration

The application automatically fetches World Cup 2026 match data from [football-data.org](https://www.football-data.org/). 

To enable automatic updates:
1. Sign up for a free API key at football-data.org
2. Add it to your `.env` file as `FOOTBALL_API_KEY`
3. The server will automatically fetch and update match results every 6 hours

## Deployment Guide

### Frontend Deployment (GitHub Pages)
The frontend is automatically built and deployed to GitHub Pages:
```bash
npm run deploy
```

This publishes the built app to `https://ssjp8.github.io/wc2026/`

### Backend Deployment Options

#### Option 1: Vercel (Recommended - Free)
1. Push code to GitHub
2. Connect repo to Vercel
3. Set root directory to `server/`
4. Add environment variables
5. Click Deploy

#### Option 2: Render (Free tier available)
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect to your GitHub repo
4. Set start command to `cd server && npm start`
5. Add environment variables
6. Deploy

#### Option 3: Railway
1. Sign up on Railway
2. Create new project and connect GitHub repo
3. Set build command to `cd server && npm install`
4. Set start command to `cd server && npm start`
5. Add environment variables
6. Deploy

#### Option 4: Self-hosted (VPS)
1. SSH into your server
2. Clone the repository
3. Install Node.js and npm
4. Install dependencies: `npm install && cd server && npm install`
5. Set up environment variables
6. Use PM2 or similar for process management:
   ```bash
   cd server
   npm install -g pm2
   pm2 start src/index.js --name "wc2026-server"
   ```

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
DATABASE_URL=./data/wc2026.db
JWT_SECRET=your_jwt_secret_key_here_change_in_production
FRONTEND_URL=http://localhost:5173
FOOTBALL_API_KEY=your_football_data_api_key_here
FOOTBALL_API_BASE_URL=https://api.football-data.org/v4
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Default Admin Credentials

After seeding the database:
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Change these credentials immediately in production!**

## Database Schema

The application uses SQLite with the following tables:
- `users` - User accounts and authentication
- `matches` - World Cup matches
- `predictions` - User predictions
- `user_points` - Aggregated points and rankings

## Troubleshooting

### Backend won't start
- Check if port 5000 is available
- Ensure all dependencies are installed: `cd server && npm install`
- Check `.env` file is properly configured

### Database errors
- Delete `server/data/wc2026.db` and restart server (will reinitialize)
- Run seed command: `npm run server:seed`

### API calls failing
- Ensure backend is running
- Check CORS settings in `server/src/index.js`
- Verify FRONTEND_URL in `.env`

### Points not calculating
- Check match status is set to 'finished'
- Run admin command to recalculate: POST `/api/admin/recalculate-points`

## Contributing

Feel free to fork this repository and submit pull requests for any improvements.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please open a GitHub issue or contact the development team.

---

**Made for World Cup 2026 enthusiasts! 🏆⚽**
