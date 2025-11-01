/**
 * useNetworkStatus Hook
 * Monitors network connectivity
 * Returns online/offline status
 */

import { useState, useEffect } from 'react';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true, // Optimistic default
    isInternetReachable: null,
    type: null,
  });

  useEffect(() => {
    // Note: In production, integrate @react-native-community/netinfo
    // For now, assume connected (backend connection status handles this)

    // Future implementation:
    // import NetInfo from '@react-native-community/netinfo';
    // const unsubscribe = NetInfo.addEventListener(state => {
    //   setStatus({
    //     isConnected: state.isConnected ?? false,
    //     isInternetReachable: state.isInternetReachable,
    //     type: state.type,
    //   });
    // });
    // return unsubscribe;

    return () => {
      // Cleanup
    };
  }, []);

  return status;
}

/**
 * Usage:
 *
 * const networkStatus = useNetworkStatus();
 *
 * if (!networkStatus.isConnected) {
 *   return <OfflineMessage />;
 * }
 */
