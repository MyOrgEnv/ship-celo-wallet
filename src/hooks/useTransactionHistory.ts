import { useCallback, useMemo } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { createPublicClient, http, getAddress } from 'viem';
import { celo, celoAlfajores } from '../config/celoChains';
import {
  CeloTransaction,
  TransactionFilters,
  PaginatedTransactions,
  TransactionQueryOptions,
  TransactionError
} from '../types/transaction';

/**
 * Create a viem client for the current chain
 */
function createViemClient(chainId: number) {
  const chain = chainId === celo.id ? celo : celoAlfajores;
  return createPublicClient({
    chain,
    transport: http(chain.rpcUrls.default.http[0])
  });
}

/**
 * Transform viem transaction to our CeloTransaction format
 */
function transformTransaction(
  tx: any,
  address: string,
  chainId: number,
  receipt?: any
): CeloTransaction {
  const from = getAddress(tx.from);
  const to = tx.to ? getAddress(tx.to) : '0x0000000000000000000000000000000000000000';
  const isContractCreation = !tx.to;
  const value = tx.value.toString();
  const gasUsed = receipt?.gasUsed?.toString() || '0';
  const gasPrice = tx.gasPrice?.toString() || '0';
  const confirmations = 1; // Simplified for now
  const status = receipt ? (receipt.status === 'success' ? 'success' : 'failure') : 'pending';

  // Determine transaction type
  let type: 'sent' | 'received' | 'contract';
  if (isContractCreation || (tx.input && tx.input !== '0x')) {
    type = 'contract';
  } else if (from.toLowerCase() === address.toLowerCase()) {
    type = 'sent';
  } else {
    type = 'received';
  }

  return {
    hash: tx.hash,
    blockNumber: tx.blockNumber?.toString() || '0',
    timestamp: Date.now(), // We'll need to get this from block data
    from,
    to,
    value,
    gasUsed,
    gasPrice,
    status: status as 'success' | 'failure' | 'pending',
    type,
    confirmations,
    chainId
  };
}

/**
 * Fetch transaction history for an address using viem
 */
async function fetchTransactionHistory(
  options: TransactionQueryOptions
): Promise<PaginatedTransactions> {
  const { address, chainId, limit = 10, filters } = options;

  try {
    const client = createViemClient(chainId);

    // Get current block number
    const currentBlockNumber = await client.getBlockNumber();

    // For simplicity, we'll fetch recent transactions by getting recent blocks
    // In a real implementation, you might want to use event logs or a more sophisticated approach
    const startBlock = currentBlockNumber - BigInt(1000); // Look back 1000 blocks
    const endBlock = currentBlockNumber;

    const transactions: CeloTransaction[] = [];

    // Get block range for transaction lookup
    // Note: This is a simplified approach. In production, you'd want to use event logs
    // or a service like Alchemy/Infura for more efficient transaction history

    for (let i = startBlock; i < endBlock && transactions.length < limit; i++) {
      try {
        const block = await client.getBlock({
          blockNumber: i,
          full: true
        });

        if (block.transactions) {
          for (const tx of block.transactions) {
            if (
              (tx.from && tx.from.toLowerCase() === address.toLowerCase()) ||
              (tx.to && tx.to.toLowerCase() === address.toLowerCase())
            ) {
              let receipt;
              try {
                receipt = await client.getTransactionReceipt({
                  hash: tx.hash as `0x${string}`
                });
              } catch {
                // Transaction might still be pending
              }

              const transformedTx = transformTransaction(tx, address, chainId, receipt);

              // Apply filters
              if (filters?.type && filters.type !== 'all') {
                if (filters.type === 'contract' && transformedTx.type !== 'contract') {
                  continue;
                }
                if (filters.type === 'sent' && transformedTx.type !== 'sent') {
                  continue;
                }
                if (filters.type === 'received' && transformedTx.type !== 'received') {
                  continue;
                }
              }

              if (filters?.status && filters.status !== 'all') {
                if (transformedTx.status !== filters.status) {
                  continue;
                }
              }

              transactions.push(transformedTx);

              if (transactions.length >= limit) {
                break;
              }
            }
          }
        }
      } catch (error) {
        // Continue with next block if current block fails
        console.warn(`Failed to fetch block ${i}:`, error);
      }
    }

    return {
      transactions: transactions.slice(0, limit),
      total: transactions.length,
      hasMore: false, // Simplified for this implementation
      nextCursor: undefined
    };

  } catch (error) {
    console.error('Error fetching transaction history:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const transactionError: TransactionError = {
      message: `Failed to fetch transactions: ${errorMessage}`,
      code: 'FETCH_ERROR'
    };
    throw transactionError;
  }
}

export function useTransactionHistory() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const fetchTransactions = useCallback(async (
    options: Omit<TransactionQueryOptions, 'address' | 'chainId'>
  ): Promise<PaginatedTransactions> => {
    if (!address) {
      const error: TransactionError = {
        message: 'No wallet address available',
        code: 'NO_ADDRESS'
      };
      throw error;
    }

    const queryOptions: TransactionQueryOptions = {
      address,
      chainId,
      ...options
    };

    return fetchTransactionHistory(queryOptions);
  }, [address, chainId]);

  const refreshTransactions = useCallback(async (
    filters?: TransactionFilters,
    limit = 10
  ) => {
    try {
      return await fetchTransactions({ filters, limit });
    } catch (error) {
      console.error('Failed to refresh transactions:', error);
      throw error;
    }
  }, [fetchTransactions]);

  const transactionSummary = useMemo(() => {
    if (!address) {
      return null;
    }

    return {
      totalSent: 0,
      totalReceived: 0,
      totalTransactions: 0,
      lastTransaction: null as CeloTransaction | null
    };
  }, [address]);

  return {
    // Data
    address,
    chainId,
    isConnected,

    // Actions
    fetchTransactions,
    refreshTransactions,

    // Metadata
    transactionSummary,

    // Error handling
    error: null as TransactionError | null
  };
}