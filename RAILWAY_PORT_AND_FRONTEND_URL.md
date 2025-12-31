# PORT and FRONTEND_URL Settings

## 1. PORT - Should You Change It?

### ✅ **Answer: You can REMOVE it (recommended) or leave it**

**Why:**
- Railway **automatically sets `PORT`** for you
- Your code already handles this: `const PORT = process.env.PORT || 3001;`
- Railway will provide the correct port automatically
- The `3001` is just a fallback that won't be used on Railway

**Recommendation:**
- **Remove `PORT=3001`** from Railway variables
- Railway will set it automatically
- Your code will use Railway's port

**OR:**
- Keep it if you want (it won't hurt, Railway will override it anyway)

---

## 2. FRONTEND_URL - What to Do Before Vercel?

### ⚠️ **Answer: Leave it EMPTY for now, but UPDATE IMMEDIATELY after Vercel deployment**

**Current Situation:**
- You don't have Vercel URL yet
- Your code has fallbacks:
  - `process.env.FRONTEND_URL || "http://localhost:3000"` (in bot.ts)
  - `process.env.FRONTEND_URL || "https://minties.app"` (in other files)

**Options:**

### Option A: Leave Empty (Recommended)
- **Action**: Remove `FRONTEND_URL` from Railway variables (or leave it empty)
- **Result**: Code will use fallback (`localhost:3000` or `minties.app`)
- **Problem**: Fallback won't work in production - Mini App buttons won't open correctly
- **Solution**: **Update immediately after Vercel deployment**

### Option B: Set Placeholder
- **Action**: Set `FRONTEND_URL=https://placeholder.vercel.app`
- **Result**: Won't work, but reminds you to update it
- **Better**: Just leave empty and update after deployment

### Option C: Use a Temporary Value
- **Action**: Set `FRONTEND_URL=http://localhost:3000` (current value)
- **Result**: Won't work in production, but won't break anything
- **Better**: Leave empty and update after deployment

---

## ✅ Recommended Action Plan

### Now (Before Vercel):
1. ✅ **Remove `PORT=3001`** from Railway variables (optional, but cleaner)
2. ✅ **Remove `FRONTEND_URL`** from Railway variables (or leave empty)
   - The bot will work, but Mini App buttons won't open until you set this

### After Vercel Deployment:
3. ✅ **Add `FRONTEND_URL`** with your actual Vercel URL:
   ```
   FRONTEND_URL=https://your-actual-frontend.vercel.app
   ```
4. ✅ Railway will auto-redeploy
5. ✅ Test Telegram bot - Mini App buttons should work

---

## What Happens If FRONTEND_URL Is Not Set?

**In Telegram Bot:**
- Bot commands will work (`/start`, `/help`, etc.)
- Mini App buttons will try to open `http://localhost:3000` (won't work)
- Users can still use bot commands, but can't open Mini App from bot

**After You Set It:**
- Mini App buttons will work correctly
- Users can open Mini App from Telegram bot
- Everything works end-to-end

---

## Summary

| Variable | Action | When |
|----------|--------|------|
| `PORT` | Remove (optional) | Now |
| `FRONTEND_URL` | Remove/leave empty | Now |
| `FRONTEND_URL` | Add with Vercel URL | After Vercel deployment |

---

## Quick Checklist

- [ ] Remove `PORT=3001` from Railway (optional)
- [ ] Remove/clear `FRONTEND_URL` from Railway
- [ ] Deploy to Vercel
- [ ] Get Vercel URL
- [ ] Add `FRONTEND_URL=https://your-vercel-url.vercel.app` to Railway
- [ ] Test Telegram bot Mini App button

---

## Important Note

⚠️ **Don't forget to update `FRONTEND_URL` after Vercel deployment!**

Without it:
- Bot works ✅
- Mini App buttons don't work ❌
- Users can't open Mini App from Telegram ❌

With it:
- Bot works ✅
- Mini App buttons work ✅
- Full functionality ✅

