// Placeholder Delegation type until MetaMask Smart Accounts Kit is available on npm
export type Delegation = Record<string, any>;

/**
 * Encode a delegation into a base64 string for sharing
 */
export function encodeDelegation(delegation: Delegation): string {
  const delegationJson = JSON.stringify(delegation);
  return Buffer.from(delegationJson, "utf-8").toString("base64");
}

/**
 * Decode a base64 string back into a delegation
 */
export function decodeDelegation(encoded: string): Delegation {
  const decoded = Buffer.from(encoded, "base64").toString("utf-8");
  return JSON.parse(decoded) as Delegation;
}

