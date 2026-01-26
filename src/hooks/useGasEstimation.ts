import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import { createGasEstimate } from '../utils/gasCalculations';
import type { GasEstimate, GasEstimationOptions } from '../types/gas';

// TODO: Implement real CELO price fetching
const CELO_PRICE_USD = 0.5; // Placeholder

export function useGasEstimation(options: GasEstimationOptions) {
  const publicClient = usePublicClient();

  const query = useQuery({
    queryKey: ['gas-estimation', options],
    queryFn: async (): Promise<GasEstimate> => {
      if (!publicClient) {
        throw new Error('Public client not available');
      }
      return createGasEstimate(publicClient, options, CELO_PRICE_USD);
    },
    enabled: !!publicClient,
    staleTime: 30000, // Consider stale after 30 seconds
    refetchInterval: 60000, // Refetch every minute for real-time updates
    retry: 2,
  });

  return {
    estimate: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}