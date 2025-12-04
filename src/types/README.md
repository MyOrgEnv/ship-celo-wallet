# Transaction Types

This directory contains type definitions for the transaction history feature.

## Files

- `transaction.ts` - Core transaction type definitions

## Types

### CeloTransaction
The main transaction interface that represents a single transaction on Celo networks.

```typescript
interface CeloTransaction {
  hash: string;              // Transaction hash
  blockNumber: string;        // Block number
  timestamp: number;          // Unix timestamp
  from: string;               // Sender address
  to: string;                 // Recipient address
  value: string;              // Transaction value in wei
  gasUsed: string;            // Gas used
  gasPrice: string;           // Gas price
  status: 'success' | 'failure' | 'pending';  // Transaction status
  type: 'sent' | 'received' | 'contract';     // Transaction type
  confirmations: number;      // Number of confirmations
  chainId: number;           // Network chain ID
}
```

### TransactionFilters
Used to filter transaction history.

```typescript
interface TransactionFilters {
  type?: 'all' | 'sent' | 'received' | 'contract';
  status?: 'all' | 'success' | 'failure' | 'pending';
  dateRange?: {
    start: number;
    end: number;
  };
}
```

### PaginatedTransactions
Response type for paginated transaction queries.

```typescript
interface PaginatedTransactions {
  transactions: CeloTransaction[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}
```

## Usage

Import types in your components:

```typescript
import { CeloTransaction, TransactionFilters } from '../types/transaction';