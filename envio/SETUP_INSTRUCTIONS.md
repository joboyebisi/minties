# Envio Setup Instructions

## ⚠️ Important: Package Issue Resolved

The `@envio-dev/envio` package doesn't exist in npm. Envio uses a CLI tool accessed via `pnpx envio`.

## Correct Setup Process

### Step 1: Initialize Envio Project

Envio uses its own initialization process. Run this from the `envio/` directory:

```powershell
cd envio
pnpx envio init
```

**When prompted:**
- Choose **"Custom"** or **"Template"**
- Select **Sepolia** network
- Enter your contract addresses (or skip for now)

This will create the proper Envio structure with:
- `config.yaml` (or similar)
- `schema.graphql`
- Proper directory structure

### Step 2: Migrate Our Handlers

After initialization, you'll need to:

1. **Copy our handlers** to the generated handlers directory
2. **Update the config** to point to our handlers
3. **Update the schema** to match our entities

### Step 3: Alternative Approach (If Init Fails)

If `pnpx envio init` has issues on Windows, you can:

1. **Use Envio Dashboard Directly**:
   - Go to https://app.envio.dev
   - Create a new indexer
   - Use their web-based setup
   - Upload your contract ABIs
   - Configure events manually

2. **Or Use The Graph Instead**:
   - Consider using The Graph Protocol as an alternative
   - Similar indexing capabilities
   - Better Windows support

## Current Status

✅ **Handlers Ready**: All event handlers are written
✅ **Schema Defined**: All entities are defined
✅ **Backend Integration**: API routes ready
⏳ **Envio CLI**: Needs proper initialization

## Next Steps

1. Try `pnpx envio init` from `envio/` directory
2. If it works, migrate our handlers to the generated structure
3. If it fails, use Envio dashboard web interface
4. Or consider alternative indexing solution

## Troubleshooting

**"Couldn't find envio binary"**
- This is a Windows compatibility issue
- Try using Envio dashboard web interface instead
- Or use WSL (Windows Subsystem for Linux)

**"Package not found"**
- Envio doesn't use npm packages
- Use `pnpx envio` commands directly
- No need to install anything

## Alternative: Use Envio Dashboard

Since the CLI has Windows issues, you can:

1. Go to https://app.envio.dev
2. Sign in with GitHub
3. Create new indexer
4. Upload contract ABIs manually
5. Configure events in the web UI
6. Deploy from dashboard

This bypasses the CLI entirely!

