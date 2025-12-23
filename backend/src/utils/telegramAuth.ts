import crypto from "crypto";

/**
 * Verify Telegram Web App initData (server-side)
 * @param initData - The initData string from Telegram
 * @param botToken - Your Telegram bot token
 * @returns boolean indicating if the data is valid
 */
export function verifyTelegramWebAppInitData(
  initData: string,
  botToken: string
): boolean {
  try {
    // Create secret key
    const secretKey = crypto
      .createHmac("sha256", "WebAppData")
      .update(botToken)
      .digest();

    // Parse and sort initData
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get("hash");
    urlParams.delete("hash");

    // Sort parameters
    const sortedParams = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    // Calculate HMAC
    const calculatedHash = crypto
      .createHmac("sha256", secretKey)
      .update(sortedParams)
      .digest("hex");

    // Verify hash
    return calculatedHash === hash;
  } catch (error) {
    console.error("Error verifying Telegram initData:", error);
    return false;
  }
}

/**
 * Parse and validate initData
 * @param initData - The initData string from Telegram
 * @returns Parsed user data or null if invalid
 */
export function parseTelegramInitData(initData: string) {
  try {
    const params = new URLSearchParams(initData);
    const userStr = params.get("user");
    
    if (!userStr) return null;

    const user = JSON.parse(userStr);
    const authDate = params.get("auth_date");
    
    // Check if auth date is recent (within 10 minutes)
    if (authDate) {
      const authTimestamp = parseInt(authDate) * 1000;
      const now = Date.now();
      const tenMinutes = 10 * 60 * 1000;
      
      if (now - authTimestamp > tenMinutes) {
        return null; // Auth data is too old
      }
    }

    return {
      user,
      authDate: authDate ? parseInt(authDate) : null,
      queryId: params.get("query_id"),
      hash: params.get("hash"),
    };
  } catch (error) {
    console.error("Error parsing Telegram initData:", error);
    return null;
  }
}

