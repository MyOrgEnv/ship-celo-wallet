import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { type ContractConfig, type ContractWriteResult } from '../types/contracts';

/**
 * Hook for writing to smart contracts (executing transactions)
 * @param config - Contract configuration with address, ABI, and chainId
 * @returns Contract write result with write function, loading state, and transaction hash
 */
export function useContractWrite(config: ContractConfig | undefined): ContractWriteResult {
  const { writeContract, data: hash, isPending, error: writeError, reset } = useWriteContract();

  const { isLoading: isConfirming, error: confirmError } = useWaitForTransactionReceipt({
    hash,
  });

  const write = (functionName: string, args?: readonly any[]) => {
    if (!config) return;

    writeContract({
      address: config.address,
      abi: config.abi,
      functionName,
      args,
      chainId: config.chainId,
    });
  };

  return {
    hash,
    isLoading: isPending || isConfirming,
    error: writeError || confirmError,
    write,
    reset,
  };
}