# How to Create .env Files

## Windows (Notepad)

### Method 1: Save As with Quotes (Easiest)

1. Open **Notepad**
2. Type your environment variables (see examples below)
3. Click **File** → **Save As**
4. In the **File name** field, type: `.env` (with quotes around it)
   - Type: `".env"` (including the quotes)
   - This tells Windows to save without an extension
5. Choose the correct folder:
   - For backend: `C:\Users\Deborah\Documents\Cursor Projects\Minties\backend\`
   - For frontend: `C:\Users\Deborah\Documents\Cursor Projects\Minties\frontend\`
6. In **Save as type**, select: **All Files** (not Text Documents)
7. Click **Save**

### Method 2: Rename After Saving

1. Open **Notepad**
2. Type your environment variables
3. Save as `env.txt` (or any name)
4. In File Explorer, rename the file from `env.txt` to `.env`
5. Windows will warn you - click **Yes**

### Method 3: Command Line (PowerShell)

```powershell
# Navigate to the directory
cd "C:\Users\Deborah\Documents\Cursor Projects\Minties\backend"

# Create .env file
New-Item -Path .env -ItemType File

# Then open it in Notepad
notepad .env
```

---

## Mac/Linux

```bash
# Navigate to directory
cd backend

# Create .env file
touch .env

# Edit it
nano .env
# or
code .env
```

---

## File Format

### Important Rules:

1. **No spaces around `=`**:
   - ✅ Correct: `TELEGRAM_BOT_TOKEN=abc123`
   - ❌ Wrong: `TELEGRAM_BOT_TOKEN = abc123`

2. **No quotes needed** (unless value has spaces):
   - ✅ Correct: `FRONTEND_URL=https://example.com`
   - ✅ Also OK: `FRONTEND_URL="https://example.com"`

3. **One variable per line**:
   ```
   TELEGRAM_BOT_TOKEN=abc123
   FRONTEND_URL=https://example.com
   SUPABASE_URL=https://xxx.supabase.co
   ```

4. **Comments start with `#`**:
   ```
   # This is a comment
   TELEGRAM_BOT_TOKEN=abc123
   ```

5. **No trailing commas or semicolons**

---

## Backend .env File

Create: `backend/.env`

```env
# Server
NODE_ENV=development
PORT=3001

# Telegram Bot
TELEGRAM_BOT_TOKEN=8046568673:AAFmeM4hOPjn_U5FNrih8zrKqGhxO1XVD6s

# Ethereum Sepolia
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
PRIVATE_KEY=0xa096bc1d642773ea6783367dffff230a808dbdcc6366fedac678db47adcd6432

# Contract Addresses
GIFT_ESCROW_ADDRESS=0x72425B766F61a83da983c1908460DF118FA125Ad
SAVINGS_CIRCLE_ADDRESS=0xEf2BF49C0394560384301A209c8793160B3D2ac8
USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238

# MetaMask Smart Accounts
SMART_ACCOUNTS_ENVIRONMENT=sepolia

# Frontend URL (local development)
FRONTEND_URL=http://localhost:3000

# Supabase
SUPABASE_URL=https://humjsqxqllzllnqaeeya.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1bWpzcXhxbGx6bGxucWFlZXlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU1OTgwMiwiZXhwIjoyMDgyMTM1ODAyfQ.xc3wAktcSnmWu0uDTHarJk7_lH719p3M5c9iaL6NDCk

# Envio HyperSync
USE_HYPERSYNC=true
HYPERSYNC_API_TOKEN=233b693d-8971-47ba-b30d-c4ce34d61f86
HYPERSYNC_URL=https://sepolia.hypersync.xyz
```

---

## Frontend .env.local File

Create: `frontend/.env.local`

**Note**: Next.js uses `.env.local` (not just `.env`) for local development.

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://humjsqxqllzllnqaeeya.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Blockchain
NEXT_PUBLIC_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
NEXT_PUBLIC_BUNDLER_URL=https://api.pimlico.io/v2/11155111/rpc

# Backend API (local development)
NEXT_PUBLIC_API_URL=http://localhost:3001

# Contract Addresses
NEXT_PUBLIC_USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
NEXT_PUBLIC_SAVINGS_CIRCLE_ADDRESS=0xEf2BF49C0394560384301A209c8793160B3D2ac8
NEXT_PUBLIC_GIFT_ESCROW_ADDRESS=0x72425B766F61a83da983c1908460DF118FA125Ad

# Network
NEXT_PUBLIC_CHAIN_ID=11155111

# Telegram Bot (for navbar link)
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=minties_bot
```

---

## Verification

### Check if file was created correctly:

1. Open File Explorer
2. Go to `backend/` or `frontend/` folder
3. Make sure **"Show file extensions"** is enabled:
   - View → Show → File name extensions
4. You should see `.env` (not `.env.txt`)

### Test if it works:

**Backend:**
```bash
cd backend
npm run dev
# Should load environment variables without errors
```

**Frontend:**
```bash
cd frontend
npm run dev
# Should load environment variables without errors
```

---

## Security Reminders

⚠️ **IMPORTANT**:

1. ✅ `.env` files are already in `.gitignore` (won't be committed)
2. ✅ Never commit `.env` files to GitHub
3. ✅ Never share `.env` files publicly
4. ✅ Use different values for development vs production
5. ✅ Rotate keys if accidentally exposed

---

## Troubleshooting

### File shows as `.env.txt`
- **Problem**: Windows added `.txt` extension
- **Fix**: Rename in File Explorer, remove `.txt`

### Variables not loading
- **Problem**: Wrong file location or name
- **Fix**: 
  - Backend: Must be `backend/.env`
  - Frontend: Must be `frontend/.env.local`
  - Check you're in the right directory

### "Cannot find module" errors
- **Problem**: File format might be wrong
- **Fix**: Check for:
  - No spaces around `=`
  - One variable per line
  - No special characters (unless quoted)

---

## Quick Reference

| Platform | File Location | File Name |
|----------|--------------|-----------|
| Backend | `backend/` | `.env` |
| Frontend | `frontend/` | `.env.local` |

---

## Alternative: Use VS Code

If you have VS Code:

1. Open the project in VS Code
2. Right-click in `backend/` folder
3. Select **New File**
4. Type: `.env`
5. VS Code will create it correctly
6. Paste your variables

This is often easier than Notepad! 👍

