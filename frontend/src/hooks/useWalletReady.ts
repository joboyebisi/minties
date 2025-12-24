import { useEffect, useState } from "react";
import { useAccount, useWalletClient, useChainId } from "wagmi";
import { sepolia } from "wagmi/chains";

/**
 * Custom hook to check if wallet is ready with timeout handling
 * Prevents infinite "Preparing wallet" state
 */
export function useWalletReady() {
  const { isConnected, address } = useAccount();
  const { data: walletClient, isPending: walletClientPending, error: walletClientError } = useWalletClient();
  const chainId = useChainId();
  const [isReady, setIsReady] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);

  const expectedChainId = sepolia.id;
  const isWrongNetwork = isConnected && chainId !== expectedChainId;

  useEffect(() => {
    // Reset timeout when connection state changes
    setTimeoutReached(false);
    
    // If wallet is connected and we have a wallet client, mark as ready
    if (isConnected && walletClient && !isWrongNetwork) {
      setIsReady(true);
      return;
    }

    // If there's an error or wrong network, not ready
    if (walletClientError || isWrongNetwork || !isConnected) {
      setIsReady(false);
      return;
    }

    // If wallet is pending, start a timeout (10 seconds)
    if (walletClientPending && isConnected) {
      const timeout = setTimeout(() => {
        setTimeoutReached(true);
        // Even if timeout, allow interaction if connected
        setIsReady(true);
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    }

    setIsReady(false);
  }, [isConnected, walletClient, walletClientPending, walletClientError, isWrongNetwork, chainId]);

  return {
    isReady: isReady || (isConnected && address && !isWrongNetwork),
    isLoading: walletClientPending && !timeoutReached,
    isWrongNetwork,
    walletClient,
    error: walletClientError,
  };
}

