/**
 * Verify Telegram Web App initData (client-side helper)
 * Note: Full verification should be done server-side for security
 * @param initData - The initData string from Telegram
 * @returns Parsed data or null
 */
export function parseTelegramInitDataClient(initData: string) {
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


