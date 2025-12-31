# Railway Settings Fixes

## Critical Issues Found

### 1. ⚠️ Root Directory NOT SET (CRITICAL)

**Current**: Not set (shows "Add Root Directory")

**Fix**: 
1. Click **"Add Root Directory"**
2. Enter: `backend`
3. Save

**Why**: Without this, Railway doesn't know where your backend code is in the monorepo.

---

### 2. ❌ Build Command Wrong

**Current**: `npm run build --workspace=minties-backend`

**Problem**: This workspace syntax won't work. Your repo isn't set up as npm workspaces.

**Fix**: 
- **Option A (Recommended)**: After setting Root Directory to `backend`, **leave Build Command empty**. Railway will auto-detect and run `npm install && npm run build`
- **Option B**: Set to: `npm install && npm run build`

---

### 3. ❌ Start Command Wrong

**Current**: `npm run start --workspace=minties-backend`

**Problem**: Same issue - workspace syntax won't work.

**Fix**:
- **Option A (Recommended)**: After setting Root Directory to `backend`, **leave Start Command empty**. Railway will auto-detect and run `npm start`
- **Option B**: Set to: `npm start`

---

### 4. ⚠️ Healthcheck Path Missing

**Current**: Not set

**Fix**:
1. Scroll to **"Healthcheck Path"** section
2. Enter: `/health`
3. Save

**Why**: Your backend has a `/health` endpoint that returns `{"status":"ok"}`. This helps Railway verify deployments are working.

---

## Step-by-Step Fix Instructions

### Step 1: Set Root Directory
1. In Railway dashboard, go to your service
2. Click **"Settings"** tab
3. Scroll to **"Source"** section
4. Click **"Add Root Directory"**
5. Enter: `backend`
6. Save

### Step 2: Fix Build Command
1. Scroll to **"Build"** section
2. Find **"Custom Build Command"**
3. **Clear the field** (leave it empty) OR set to: `npm install && npm run build`
4. Save

### Step 3: Fix Start Command
1. Scroll to **"Deploy"** section
2. Find **"Custom Start Command"**
3. **Clear the field** (leave it empty) OR set to: `npm start`
4. Save

### Step 4: Add Healthcheck
1. Scroll to **"Deploy"** section
2. Find **"Healthcheck Path"**
3. Enter: `/health`
4. Save

---

## Correct Settings Summary

After fixes, your settings should be:

```
Source:
  Root Directory: backend ✅
  Branch: main ✅

Build:
  Build Command: (empty - auto-detect) OR npm install && npm run build ✅
  Watch Paths: /backend/** ✅

Deploy:
  Start Command: (empty - auto-detect) OR npm start ✅
  Healthcheck Path: /health ✅
```

---

## Why This Matters

- **Root Directory**: Without it, Railway looks in the wrong place and can't find `package.json`
- **Build Command**: Wrong syntax causes build failures
- **Start Command**: Wrong syntax causes deployment failures
- **Healthcheck**: Without it, Railway can't verify your app is running correctly

---

## After Making Changes

1. Railway will automatically trigger a new deployment
2. Watch the **"Deployments"** tab for progress
3. Check **"Logs"** if there are any errors
4. Once deployed, test: `https://your-railway-url.up.railway.app/health`

---

## Verification

After fixing, you should see in logs:
```
🚀 Minties backend server running on port 3001
📱 Telegram bot initialized
```

And `/health` endpoint should return:
```json
{"status":"ok","timestamp":"..."}
```

