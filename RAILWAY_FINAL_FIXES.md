# Railway Settings - Final Fixes Needed

## ✅ What's Already Fixed

- ✅ Root Directory: `/backend` - **PERFECT!**
- ✅ Start Command: `npm run start` - **GOOD!** (though `npm start` would also work)

## ❌ What Still Needs Fixing

### 1. Build Command

**Current**: `npm run build --workspace=minties-backend`

**Problem**: The `--workspace` flag won't work because:
- Your repo isn't set up as npm workspaces
- Root Directory is already set to `/backend`, so Railway is already in the right place

**Fix**: 
1. Go to **"Build"** section
2. Find **"Custom Build Command"**
3. **Clear the entire field** (delete everything, leave it empty)
4. OR change to: `npm install && npm run build`

**Why empty is better**: With Root Directory set to `/backend`, Railway will automatically:
- Run `npm install` in the `/backend` directory
- Then run `npm run build` (which runs `tsc` to compile TypeScript)

---

### 2. Healthcheck Path

**Current**: Not set (shows "Healthcheck Path" with empty field)

**Fix**:
1. Scroll to **"Deploy"** section
2. Find **"Healthcheck Path"**
3. Enter: `/health`
4. Save

**Why**: Your backend has this endpoint:
```typescript
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});
```

Railway will call this endpoint after deployment to verify your app is running correctly.

---

## Step-by-Step Instructions

### Fix Build Command:
1. In Railway dashboard → Your service → **Settings** tab
2. Scroll to **"Build"** section
3. Find **"Custom Build Command"**
4. **Delete** `npm run build --workspace=minties-backend`
5. **Leave field empty** OR type: `npm install && npm run build`
6. Save

### Fix Healthcheck:
1. Still in **Settings** tab
2. Scroll to **"Deploy"** section
3. Find **"Healthcheck Path"**
4. Enter: `/health`
5. Save

---

## Final Settings Summary

After these fixes:

```
Source:
  Root Directory: /backend ✅
  Branch: main ✅

Build:
  Build Command: (empty) ✅ OR npm install && npm run build
  Watch Paths: /backend/** ✅

Deploy:
  Start Command: npm run start ✅ (or npm start)
  Healthcheck Path: /health ✅
```

---

## After Making Changes

1. Railway will automatically trigger a new deployment
2. Watch the **"Deployments"** tab
3. Check **"Logs"** for:
   ```
   🚀 Minties backend server running on port 3001
   📱 Telegram bot initialized
   ```
4. Test health endpoint: `https://your-railway-url.up.railway.app/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

---

## Why These Matter

- **Build Command**: Wrong syntax causes build failures. Empty = Railway auto-detects correctly.
- **Healthcheck**: Without it, Railway can't verify your deployment succeeded. Failed healthchecks can cause deployment issues.

---

## Optional: Start Command Note

Your current `npm run start` is fine, but you could also use just `npm start` (shorter). Both work the same since your `package.json` has:
```json
"start": "node dist/index.js"
```

Either way is fine! ✅

