import { CeloTransaction } from '../types/transaction';

/**
 * Calculate transaction summary statistics
 */
export function calculateTransactionSummary(transactions: CeloTransaction[]) {
  const summary = {
    totalSent: 0,
    totalReceived: 0,
    totalTransactions: transactions.length,
    averageGasUsed: 0,
    totalGasUsed: 0,
    uniqueAddresses: new Set<string>(),
    lastTransaction: null as CeloTransaction | null
  };

  for (const tx of transactions) {
    // Add to unique addresses
    summary.uniqueAddresses.add(tx.from);
    summary.uniqueAddresses.add(tx.to);

    // Calculate totals by type
    const value = BigInt(tx.value);
    if (tx.type === 'sent') {
      summary.totalSent += Number(value);
    } else if (tx.type === 'received') {
      summary.totalReceived += Number(value);
    }

    // Accumulate gas usage
    summary.totalGasUsed += BigInt(tx.gasUsed);

    // Track last transaction
    if (!summary.lastTransaction || tx.timestamp > summary.lastTransaction.timestamp) {
      summary.lastTransaction = tx;
    }
  }

  // Calculate average gas used
  if (summary.totalTransactions > 0) {
    summary.averageGasUsed = Number(summary.totalGasUsed) / summary.totalTransactions;
  }

  return {
    ...summary,
    uniqueAddresses: summary.uniqueAddresses.size
  };
}

/**
 * Group transactions by date
 */
export function groupTransactionsByDate(transactions: CeloTransaction[]) {
  const grouped = new Map<string, CeloTransaction[]>();

  for (const tx of transactions) {
    const date = new Date(tx.timestamp * 1000);
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(tx);
  }

  return grouped;
}

/**
 * Sort transactions by various criteria
 */
export function sortTransactions(
  transactions: CeloTransaction[],
  sortBy: 'timestamp' | 'value' | 'gasUsed' = 'timestamp',
  order: 'asc' | 'desc' = 'desc'
) {
  const sorted = [...transactions];

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
    case 'timestamp':
      comparison = a.timestamp - b.timestamp;
      break;
    case 'value':
      comparison = BigInt(a.value) > BigInt(b.value) ? 1 : -1;
      break;
    case 'gasUsed':
      comparison = BigInt(a.gasUsed) > BigInt(b.gasUsed) ? 1 : -1;
      break;
    }

    return order === 'desc' ? -comparison : comparison;
  });

  return sorted;
}

/**
 * Check if transaction is pending
 */
export function isTransactionPending(tx: CeloTransaction): boolean {
  return tx.status === 'pending' && tx.confirmations < 3;
}

/**
 * Check if transaction is recent (within last 24 hours)
 */
export function isTransactionRecent(tx: CeloTransaction): boolean {
  const oneDayAgo = Date.now() / 1000 - 86400; // 24 hours in seconds
  return tx.timestamp > oneDayAgo;
}

/**
 * Calculate estimated transaction time based on gas price
 */
export function estimateTransactionTime(gasPrice: string): string {
  try {
    const gasPriceGwei = Number(gasPrice) / 1e9; // Convert wei to gwei

    if (gasPriceGwei < 20) {
      return '5-15 minutes';
    }
    if (gasPriceGwei < 50) {
      return '1-5 minutes';
    }
    if (gasPriceGwei < 100) {
      return '30 seconds - 2 minutes';
    }
    return '15 seconds - 1 minute';
  } catch {
    return 'Unknown';
  }
}

/**
 * Validate transaction data integrity
 */
export function validateTransaction(tx: Partial<CeloTransaction>): string[] {
  const errors: string[] = [];

  if (!tx.hash) {
    errors.push('Transaction hash is required');
  }
  if (!tx.from) {
    errors.push('From address is required');
  }
  if (!tx.to) {
    errors.push('To address is required');
  }
  if (!tx.value) {
    errors.push('Value is required');
  }
  if (!tx.status) {
    errors.push('Status is required');
  }
  if (!tx.type) {
    errors.push('Type is required');
  }
  if (tx.chainId === undefined) {
    errors.push('Chain ID is required');
  }

  // Validate address format
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (tx.from && !addressRegex.test(tx.from)) {
    errors.push('Invalid from address format');
  }
  if (tx.to && !addressRegex.test(tx.to)) {
    errors.push('Invalid to address format');
  }

  // Validate hash format
  const hashRegex = /^0x[a-fA-F0-9]{64}$/;
  if (tx.hash && !hashRegex.test(tx.hash)) {
    errors.push('Invalid transaction hash format');
  }

  return errors;
}

/**
 * Format gas price for display
 */
export function formatGasPrice(gasPrice: string): string {
  try {
    const gasPriceGwei = Number(gasPrice) / 1e9; // Convert wei to gwei
    return `${gasPriceGwei.toFixed(2)} Gwei`;
  } catch {
    return 'Unknown';
  }
}

/**
 * Get transaction risk level based on various factors
 */
export function getTransactionRiskLevel(tx: CeloTransaction): 'low' | 'medium' | 'high' {
  const value = BigInt(tx.value);
  const gasPrice = BigInt(tx.gasPrice);

  // High value transactions
  if (value > BigInt('100000000000000000000')) { // > 100 CELO
    return 'high';
  }

  // Low gas price transactions (may be stuck)
  if (gasPrice < BigInt('1000000000')) { // < 1 Gwei
    return 'medium';
  }

  // Recent transactions with low confirmations
  if (tx.confirmations < 2 && isTransactionRecent(tx)) {
    return 'medium';
  }

  return 'low';
}

/**
 * Calculate total transaction volume for a period
 */
export function calculateTransactionVolume(
  transactions: CeloTransaction[],
  period: 'daily' | 'weekly' | 'monthly' = 'daily'
): { period: string; volume: bigint; count: number } {
  const now = Date.now() / 1000;
  let periodStart: number;

  switch (period) {
  case 'daily':
    periodStart = now - 86400; // 24 hours
    break;
  case 'weekly':
    periodStart = now - 604800; // 7 days
    break;
  case 'monthly':
    periodStart = now - 2592000; // 30 days
    break;
  }

  const filteredTxs = transactions.filter(tx => tx.timestamp >= periodStart);
  const totalVolume = filteredTxs.reduce((sum, tx) => sum + BigInt(tx.value), BigInt(0));

  return {
    period,
    volume: totalVolume,
    count: filteredTxs.length
  };
}