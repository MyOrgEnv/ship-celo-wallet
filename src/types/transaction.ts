// Transaction types for Celo wallet
export interface CeloTransaction {
  hash: string;
  blockNumber: string;
  timestamp: number;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  status: 'success' | 'failure' | 'pending';
  type: 'sent' | 'received' | 'contract';
  confirmations: number;
  chainId: number;
}

export interface TransactionFilters {
  type?: 'all' | 'sent' | 'received' | 'contract';
  status?: 'all' | 'success' | 'failure' | 'pending';
  dateRange?: {
    start: number;
    end: number;
  };
}

export interface PaginatedTransactions {
  transactions: CeloTransaction[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface TransactionError {
  message: string;
  code?: string;
  details?: unknown;
}

export type TransactionQueryOptions = {
  address: string;
  chainId: number;
  limit?: number;
  cursor?: string;
  filters?: TransactionFilters;
};