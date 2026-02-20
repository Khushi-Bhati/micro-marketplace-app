# 🚀 Deployment Guide — MicroMart

This guide covers deploying all three components to free-tier cloud services.

| Component | Platform | Free Tier |
|-----------|----------|-----------|
| Backend   | [Render](https://render.com) | ✅ Free web service |
| Web App   | [Vercel](https://vercel.com) | ✅ Free hosting |
| Mobile    | [Expo EAS](https://expo.dev) | ✅ Free builds |

---

## 1. 🗄️ Backend — Deploy to Render

### Prerequisites
- [Render account](https://render.com) (free)
- GitHub repo with the project pushed

### Steps

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/micro-marketplace-app.git
   git push -u origin main
   ```

2. **Create a new Web Service on Render**
   - Go to [render.com](https://render.com) → **New** → **Web Service**
   - Connect your GitHub repo
   - Set the **Root Directory** to `backend`
   - Set the following:

   | Field | Value |
   |-------|-------|
   | Runtime | Node |
   | Build Command | `npm install && npm run seed` |
   | Start Command | `node server.js` |

3. **Add Environment Variables** (in Render dashboard → Environment):
   ```
   PORT=10000
   JWT_SECRET=your_super_secret_key_change_this
   JWT_EXPIRES_IN=7d
   DB_PATH=./database.sqlite
   ```

4. **Deploy** — Render will auto-deploy on every push to `main`.

5. **Note your backend URL** — e.g. `https://micro-marketplace-api.onrender.com`

> ⚠️ **SQLite note:** Render's free tier has an ephemeral filesystem — the SQLite DB resets on redeploy. For a persistent solution, use [Railway](https://railway.app) with PostgreSQL (see below).

---

### Alternative: Railway (with persistent PostgreSQL)

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select the `backend` root directory
3. Add a **PostgreSQL** plugin to your project
4. Update `backend/config/database.js` to use the `DATABASE_URL` env var with `pg` or `better-sqlite3` stays and Railway provides a volume

---

## 2. 🌐 Web App — Deploy to Vercel

### Steps

1. **Install Vercel CLI** (optional, can also use dashboard)
   ```bash
   npm install -g vercel
   ```

2. **Set the API base URL** before building. Create `web/.env.production`:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

3. **Update `web/src/services/api.js`** to use the env var:
   ```js
   const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
   ```

4. **Deploy via Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com) → **New Project**
   - Import your GitHub repo
   - Set **Root Directory** to `web`
   - Set **Framework Preset** to `Vite`
   - Add Environment Variable: `VITE_API_URL` = your Render backend URL
   - Click **Deploy**

   **OR via CLI:**
   ```bash
   cd web
   vercel --prod
   ```

5. Your web app will be live at `https://your-project.vercel.app`

---

## 3. 📱 Mobile App — Build with Expo EAS

### Prerequisites
- [Expo account](https://expo.dev) (free)
- EAS CLI installed

### Steps

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   eas login
   ```

2. **Update the API URL** in `mobile/src/services/api.js`:
   ```js
   const API_BASE = 'https://your-backend-url.onrender.com';
   ```

3. **Configure EAS** in `mobile/`:
   ```bash
   cd mobile
   eas build:configure
   ```
   This creates `eas.json` automatically.

4. **Build for Android APK** (easiest to share/test):
   ```bash
   eas build -p android --profile preview
   ```
   - This produces a shareable `.apk` file
   - Download from the Expo dashboard and install on any Android device

5. **Build for iOS** (requires Apple Developer account):
   ```bash
   eas build -p ios --profile preview
   ```

6. **Publish to Expo Go** (for testing without installing):
   ```bash
   eas update --branch main --message "Initial release"
   ```
   Users can scan the QR code in the **Expo Go** app.

---

## 4. 🔗 Update CORS for Production

After deploying the web app, update the backend to allow requests from your Vercel domain.

In `backend/server.js`, replace:
```js
app.use(cors());
```
With:
```js
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-project.vercel.app',  // ← add your Vercel URL
  ],
  credentials: true,
}));
```

Then redeploy the backend.

---

## 5. ✅ Quick Checklist

- [ ] Backend deployed on Render / Railway
- [ ] Seed script ran (`npm run seed`)
- [ ] Web app deployed on Vercel with correct `VITE_API_URL`
- [ ] Mobile `API_BASE` updated to production backend URL
- [ ] CORS updated to allow Vercel origin
- [ ] Test login with `john@example.com / password123`

---

## 📝 Local Development (Quick Reference)

```bash
# Terminal 1 — Backend
cd backend && npm run dev        # http://localhost:5000

# Terminal 2 — Web
cd web && npm run dev            # http://localhost:5173

# Terminal 3 — Mobile
cd mobile && npx expo start --lan --clear   # Scan QR with Expo Go
```
