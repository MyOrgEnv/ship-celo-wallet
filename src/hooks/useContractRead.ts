import { useReadContract } from 'wagmi';
import { type ContractConfig, type ContractCallResult } from '../types/contracts';

/**
 * Hook for reading data from smart contracts
 * @param config - Contract configuration with address, ABI, and chainId
 * @param functionName - The contract function to call
 * @param args - Arguments for the contract function
 * @param options - Additional options for the read call
 * @returns Contract call result with data, loading state, and error
 */
export function useContractRead<T = any>(
  config: ContractConfig | undefined,
  functionName: string,
  args?: readonly any[],
  options?: {
    enabled?: boolean;
    watch?: boolean;
  }
): ContractCallResult<T> {
  const { data, isLoading, error, refetch } = useReadContract({
    address: config?.address,
    abi: config?.abi,
    functionName,
    args,
    chainId: config?.chainId,
    query: {
      enabled: options?.enabled ?? !!config,
      refetchInterval: options?.watch ? 10000 : false, // Refetch every 10 seconds if watching
    },
  });

  return {
    data: data as T,
    isLoading,
    error: error as Error | undefined,
    refetch,
  };
}