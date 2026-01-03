// Deprecated: Logic moved to @/app/actions/hypersync-actions.ts to support Server Actions
// and avoid importing native modules in client bundles.

export async function getWalletHistory(address: string) {
    throw new Error("Deprecated. Use getWalletHistoryAction from @/app/actions/hypersync-actions");
}
