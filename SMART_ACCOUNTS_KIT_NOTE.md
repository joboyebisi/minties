# MetaMask Smart Accounts Kit - Installation Note

## Current Status

The `@metamask/smart-accounts-kit` package is not yet available on npm. The project has been set up to work with `viem` and `wagmi` for now.

## When the Package is Available

Once the MetaMask Smart Accounts Kit is published, you'll need to:

1. **Install the package:**
```bash
cd backend && npm install @metamask/smart-accounts-kit
cd ../frontend && npm install @metamask/smart-accounts-kit
```

2. **Update imports:**
   - Backend: The services already have the correct import structure
   - Frontend: Update components to use the official package

3. **Features to enable:**
   - Advanced Permissions (ERC-7715)
   - Delegation system (ERC-7710)
   - Smart Account creation
   - Periodic permissions for savings circles

## Current Workaround

The project uses:
- `viem` for Ethereum interactions
- `wagmi` for React hooks
- `ethers` for backend contract interactions

These provide the foundation for smart account functionality, but Advanced Permissions will require the official MetaMask Smart Accounts Kit when available.

## Resources

- [MetaMask Smart Accounts Documentation](https://docs.metamask.io/smart-accounts-kit/)
- Check npm for package availability: `npm view @metamask/smart-accounts-kit`

