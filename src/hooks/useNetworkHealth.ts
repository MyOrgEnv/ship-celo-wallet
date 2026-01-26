import { useState, useEffect, useCallback } from 'react';
import { useCeloNetwork } from './useCeloNetwork';
import {
  checkMultipleEndpoints,
  calculateAverageResponseTime,
  determineCongestionLevel,
  fetchBlockData,
  getGasPrice,
  estimateTransactionSuccessRate
} from '../utils/networkMonitoring';
import type {
  NetworkHealthData,
  RPCEndpoint,
  NetworkHealthMetrics,
  NetworkStatus
} from '../types/network';

interface UseNetworkHealthOptions {
  /** Polling interval in milliseconds, default 30000 (30 seconds) */
  interval?: number;
  /** Array of RPC endpoints to monitor */
  endpoints: RPCEndpoint[];
  /** Cache timeout in milliseconds, default 10000 (10 seconds) */
  cacheTimeout?: number;
}

/**
 * Custom hook for monitoring Celo network health.
 *
 * This hook periodically checks the health of RPC endpoints for the current Celo network,
 * calculating metrics like response times, congestion levels, and overall network status.
 * It uses caching to avoid unnecessary requests and provides real-time updates.
 *
 * @param options - Configuration options for network health monitoring
 * @returns Object containing health data, loading state, and error information
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useNetworkHealth({
 *   endpoints: celoEndpoints,
 *   interval: 30000,
 *   cacheTimeout: 15000
 * });
 * ```
 */
export function useNetworkHealth(options: UseNetworkHealthOptions) {
  const { currentChainId } = useCeloNetwork();
  const [data, setData] = useState<NetworkHealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  const interval = options.interval || 30000;
  const cacheTimeout = options.cacheTimeout || 10000; // 10 seconds default
  const endpoints = options.endpoints.filter((e) => e.chainId === currentChainId);

  const fetchHealth = useCallback(async () => {
    if (endpoints.length === 0) {return;}

    // Check if we have recent data and can skip fetching
    const now = Date.now();
    if (data && (now - lastFetchTime) < cacheTimeout) {
      return; // Use cached data
    }

    setLoading(true);
    setError(null);

    try {
      // Check all endpoints for the current chain
      await checkMultipleEndpoints(endpoints);

      // Calculate average response time
      const avgResponseTime = calculateAverageResponseTime(
        endpoints.map((e) => e.metrics)
      );

      // Use the first active endpoint for additional metrics, with fallback switching
      const activeEndpoints = endpoints.filter((e) => e.isActive);
      let gasPrice = 0n;
      let transactionSuccessRate = 0;
      let blockProductionTime = 0;
      let lastBlockNumber = 0;

      for (const endpoint of activeEndpoints) {
        try {
          gasPrice = await getGasPrice(endpoint);
          transactionSuccessRate = await estimateTransactionSuccessRate(endpoint);

          const blocks = await fetchBlockData(endpoint, 10);
          if (blocks.length > 1) {
            // Calculate average block production time in seconds
            const timeDiffs = blocks
              .slice(1)
              .map((block, i) => Number(blocks[i].timestamp - block.timestamp));
            blockProductionTime =
              timeDiffs.reduce((sum, diff) => sum + diff, 0) / timeDiffs.length / 1000;
          }
          lastBlockNumber = Number(blocks[0]?.number || 0);
          break; // Successfully got data, stop trying other endpoints
        } catch (error) {
          console.warn(`Failed to fetch data from ${endpoint.url}, trying next endpoint:`, error);
          continue; // Try next endpoint
        }
      }

      // Determine congestion level
      const congestionLevel = determineCongestionLevel(gasPrice, avgResponseTime);

      // Determine overall network status
      const healthyCount = endpoints.filter((e) => e.status === 'healthy').length;
      let status: NetworkStatus;
      if (healthyCount === endpoints.length) {
        status = 'healthy';
      } else if (healthyCount === 0) {
        status = 'down';
      } else {
        status = 'degraded';
      }

      const metrics: NetworkHealthMetrics = {
        rpcResponseTime: avgResponseTime,
        transactionSuccessRate,
        blockProductionTime,
        gasPriceTrend: 'stable', // Placeholder; could be calculated based on historical data
        connectedPeerCount: 0, // Placeholder; requires additional implementation
        lastBlockNumber,
        timestamp: new Date()
      };

      const healthData: NetworkHealthData = {
        chainId: currentChainId,
        status,
        congestionLevel,
        metrics,
        rpcEndpoints: endpoints,
        lastUpdated: new Date()
      };

      setData(healthData);
      setLastFetchTime(now);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [endpoints, currentChainId, data, lastFetchTime, cacheTimeout]);

  useEffect(() => {
    fetchHealth();
    const id = setInterval(fetchHealth, interval);
    return () => clearInterval(id);
  }, [fetchHealth, interval]);

  return { data, loading, error };
}