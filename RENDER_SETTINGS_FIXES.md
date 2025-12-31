# Render Settings - Fixes Needed

## ❌ Issues Found

### 1. Build Command - WRONG
**Current**: `/backend/ $ npm install; npm run build`

**Problems**:
- `/backend/ $` prefix shouldn't be there
- Should use `&&` not `;` (to stop on error)

**Fix**: Change to:
```
npm install && npm run build
```

---

### 2. Start Command - WRONG
**Current**: `/backend/ $ yarn start`

**Problems**:
- `/backend/ $` prefix shouldn't be there
- Uses `yarn` but your project uses `npm`
- Should be `npm start`

**Fix**: Change to:
```
npm start
```

---

### 3. FRONTEND_URL - Check Value
**Current**: Shows `value`

**Problem**: This looks like a placeholder

**Fix**: 
- If you haven't deployed to Vercel yet: Leave it empty or set to `http://localhost:3000` (temporary)
- After Vercel deployment: Update to your actual Vercel URL (e.g., `https://minties-frontend.vercel.app`)

---

## ✅ What's Correct

- ✅ Root Directory: `/backend` - **PERFECT!**
- ✅ Language: Node - **CORRECT!**
- ✅ Branch: main - **CORRECT!**
- ✅ Region: Frankfurt (EU Central) - **GOOD!**
- ✅ Instance Type: Free - **OK for now**
- ✅ Environment Variables: Most are set correctly

---

## Step-by-Step Fix Instructions

### Fix Build Command:
1. Find **"Build Command"** field
2. Delete: `/backend/ $ npm install; npm run build`
3. Enter: `npm install && npm run build`
4. Save

### Fix Start Command:
1. Find **"Start Command"** field
2. Delete: `/backend/ $ yarn start`
3. Enter: `npm start`
4. Save

### Fix FRONTEND_URL:
1. Find **"FRONTEND_URL"** in Environment Variables
2. If it says `value`, change it to:
   - Temporary: `http://localhost:3000` (or leave empty)
   - After Vercel: `https://your-vercel-url.vercel.app`

---

## Correct Settings Summary

After fixes:

```
Root Directory: /backend ✅
Build Command: npm install && npm run build ✅
Start Command: npm start ✅
FRONTEND_URL: (your Vercel URL or temporary value) ✅
```

---

## Why These Matter

- **Build Command**: Wrong prefix and `;` instead of `&&` can cause build failures
- **Start Command**: `yarn` won't work if you use `npm`, and wrong prefix causes errors
- **FRONTEND_URL**: Telegram bot needs this to generate Mini App links

---

## After Making Changes

1. Click **"Deploy web service"** or **"Save Changes"**
2. Render will start building
3. Watch the **"Logs"** tab for progress
4. You should see:
   ```
   🚀 Minties backend server running on port 10000
   📱 Telegram bot initialized
   ```

---

## Quick Checklist

- [ ] Build Command: `npm install && npm run build` (no prefix)
- [ ] Start Command: `npm start` (no prefix, not yarn)
- [ ] FRONTEND_URL: Set to actual URL or temporary value
- [ ] All other environment variables are set
- [ ] Root Directory: `/backend`

Fix these 3 things and you're ready to deploy! 🚀

