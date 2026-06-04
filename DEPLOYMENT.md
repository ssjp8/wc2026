# WC2026 Deployment Guide

## Quick Start - Local Development

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install && cd ..
```

### 2. Set Up Environment

```bash
# Backend already has .env file, but you can customize it
# For football-data.org API (optional but recommended):
# 1. Go to https://www.football-data.org/
# 2. Sign up for a free account
# 3. Copy your API key
# 4. Edit server/.env and set FOOTBALL_API_KEY
```

### 3. Start the Application

**Terminal 1 - Backend:**
```bash
npm run server
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# App runs on http://localhost:5173
```

**Terminal 3 - Database Setup (first time only):**
```bash
npm run server:seed
# Creates admin user (username: admin, password: admin123)
```

---

## Deployment to Production

### Frontend Deployment (GitHub Pages) ✅

The frontend is already configured to deploy to GitHub Pages automatically:

```bash
# Build and deploy to https://ssjp8.github.io/wc2026/
npm run deploy
```

This command:
1. Runs `npm run build` to create production build
2. Deploys to GitHub Pages using gh-pages package

### Backend Deployment - Choose One Option

## Option 1: Vercel (Recommended - Free, Serverless)

**Step 1: Prepare your repository**
```bash
# Make sure all changes are committed
git add .
git commit -m "Add World Cup 2026 prediction game"
git push origin main
```

**Step 2: Deploy on Vercel**
1. Go to https://vercel.com/
2. Click "New Project"
3. Import your GitHub repository (ssjp8/wc2026)
4. Configure project:
   - Framework: Other
   - Root Directory: `server`
   - Environment Variables:
     ```
     PORT=3000
     NODE_ENV=production
     DATABASE_URL=/tmp/wc2026.db
     JWT_SECRET=your_production_secret_key_here
     FRONTEND_URL=https://ssjp8.github.io/wc2026
     FOOTBALL_API_KEY=your_api_key
     FOOTBALL_API_BASE_URL=https://api.football-data.org/v4
     ```

**Step 3: Update Frontend**
Create `.env` in root folder:
```
VITE_API_URL=https://your-vercel-app.vercel.app/api
```

Then redeploy:
```bash
npm run deploy
```

---

## Option 2: Render (Free, Great Alternative)

**Step 1: Prepare repository**
```bash
git add .
git commit -m "Add World Cup 2026 prediction game"
git push origin main
```

**Step 2: Deploy on Render**
1. Go to https://render.com/
2. Click "New +"
3. Select "Web Service"
4. Connect your GitHub repository
5. Configure:
   - Repository: ssjp8/wc2026
   - Branch: main
   - Root Directory: `server`
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables:
     ```
     PORT=5000
     NODE_ENV=production
     DATABASE_URL=/var/data/wc2026.db
     JWT_SECRET=your_production_secret_key
     FRONTEND_URL=https://ssjp8.github.io/wc2026
     FOOTBALL_API_KEY=your_api_key
     FOOTBALL_API_BASE_URL=https://api.football-data.org/v4
     ```

**Step 3: Update Frontend**
```
VITE_API_URL=https://your-render-service.onrender.com/api
```

Deploy:
```bash
npm run deploy
```

---

## Option 3: Railway (Free Credits Available)

1. Go to https://railway.app/
2. Connect GitHub account
3. Create new project
4. Deploy GitHub repository
5. Configure root directory: `server`
6. Add environment variables (same as Render)
7. Railway will auto-detect Node.js and deploy

---

## Option 4: Self-Hosted (VPS/Dedicated Server)

### Using DigitalOcean or AWS:

**Step 1: Create a Droplet/Instance**
- Ubuntu 20.04+ recommended
- Minimum: 1GB RAM, 1 CPU
- 5GB storage

**Step 2: SSH and Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Git
sudo apt install -y git

# Clone repository
git clone https://github.com/ssjp8/wc2026.git
cd wc2026

# Install dependencies
npm install
cd server && npm install && cd ..
```

**Step 3: Setup Environment**
```bash
nano server/.env
# Add your production environment variables
# Set NODE_ENV=production
# Set FRONTEND_URL to your GitHub Pages URL
# Set JWT_SECRET to a strong random string
```

**Step 4: Setup PM2 (Process Manager)**
```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the backend server
cd server
pm2 start src/index.js --name "wc2026-server"

# Enable auto-restart on reboot
pm2 startup
pm2 save

# Monitor
pm2 logs wc2026-server
```

**Step 5: Setup Nginx (Reverse Proxy)**
```bash
sudo apt install -y nginx

# Create config
sudo nano /etc/nginx/sites-available/wc2026
```

Add this config:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable it:
```bash
sudo ln -s /etc/nginx/sites-available/wc2026 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**Step 6: Setup SSL (Let's Encrypt)**
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

**Step 7: Update Frontend**
```bash
# Edit root/.env
VITE_API_URL=https://your-domain.com/api

# Deploy
npm run deploy
```

---

## Database Backup & Recovery

### Backup
```bash
# For local development
cp server/data/wc2026.db wc2026_backup_$(date +%Y%m%d).db

# For production (scheduled backup)
0 2 * * * cp /path/to/wc2026.db /path/to/backups/wc2026_$(date +\%Y\%m\%d).db
```

### Recovery
```bash
# Stop server
pm2 stop wc2026-server

# Restore backup
cp wc2026_backup_20260101.db server/data/wc2026.db

# Start server
pm2 start wc2026-server
```

---

## Monitoring & Maintenance

### Check Server Status
```bash
# Vercel
vercel logs

# Render
# Check in dashboard

# Self-hosted with PM2
pm2 logs wc2026-server
pm2 status
```

### Update Match Results Manually
```bash
# If automatic fetch doesn't work, manually add results
# Use the Admin Panel:
# 1. Login with admin account
# 2. Go to Admin > Manage Matches
# 3. Update Match Result with scores
```

### Recalculate Points
```bash
# If there are calculation issues
# Admin Panel > Recalculate Points
# Or via API:
curl -X POST http://localhost:5000/api/admin/recalculate-points \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Environment Variables Summary

### Required
```
JWT_SECRET=long_random_string_min_32_chars
FRONTEND_URL=https://ssjp8.github.io/wc2026
```

### Optional but Recommended
```
FOOTBALL_API_KEY=your_football_data_api_key
NODE_ENV=production
PORT=5000
```

### Auto-Generated
```
DATABASE_URL=./data/wc2026.db
FOOTBALL_API_BASE_URL=https://api.football-data.org/v4
```

---

## Troubleshooting

### CORS Errors
- Ensure FRONTEND_URL in backend .env matches your frontend URL
- Check that Authorization header includes "Bearer" token

### Database Locked
- Stop the server
- Delete `server/data/wc2026.db`
- Restart (will reinitialize database)

### API Key Not Working
- Verify football-data.org API key is correct
- Check if key has API access enabled
- Backend will still work without it (manual match entry only)

### Points Not Updating
- Ensure match status is set to "finished" when adding results
- Admin Panel > Recalculate Points to force recalculation
- Check server logs for errors

---

## Next Steps

1. ✅ Deploy frontend to GitHub Pages: `npm run deploy`
2. ✅ Choose backend deployment option above
3. ✅ Get football-data.org API key (optional)
4. ✅ Set all environment variables
5. ✅ Test the application
6. ✅ Seed admin user and test login
7. ✅ Create some test matches and predictions
8. ✅ Monitor logs for any issues

---

**Deployment Complete! Your World Cup 2026 Prediction Game is live! 🏆⚽**
