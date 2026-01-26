import { celo, celoAlfajores } from '../config/celoChains';

// Celo block explorer URLs
const EXPLORER_URLS = {
  [celo.id]: 'https://explorer.celo.org',
  [celoAlfajores.id]: 'https://alfajores.celoscan.io'
} as const;

// API endpoints for different explorers
const EXPLORER_API_URLS = {
  [celo.id]: 'https://explorer.celo.org/api',
  [celoAlfajores.id]: 'https://api-alfajores.celoscan.io/api'
} as const;

export interface ExplorerTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  confirmations: string;
  gasUsed: string;
  gasPrice: string;
  isError: string;
  txreceipt_status: string;
  contractAddress?: string;
  input?: string;
  type?: string;
}

export interface ExplorerResponse<T = any> {
  status: string;
  message: string;
  result: T;
}

/**
 * Get the appropriate block explorer URL for a given chain ID
 */
export function getExplorerUrl(chainId: number): string {
  return EXPLORER_URLS[chainId as keyof typeof EXPLORER_URLS] || EXPLORER_URLS[celoAlfajores.id];
}

/**
 * Get the appropriate block explorer API URL for a given chain ID
 */
export function getExplorerApiUrl(chainId: number): string {
  return EXPLORER_API_URLS[chainId as keyof typeof EXPLORER_API_URLS] || EXPLORER_API_URLS[celoAlfajores.id];
}

/**
 * Generate a transaction URL for the appropriate explorer
 */
export function getTransactionUrl(hash: string, chainId: number): string {
  const explorerUrl = getExplorerUrl(chainId);
  return `${explorerUrl}/tx/${hash}`;
}

/**
 * Generate an address URL for the appropriate explorer
 */
export function getAddressUrl(address: string, chainId: number): string {
  const explorerUrl = getExplorerUrl(chainId);
  return `${explorerUrl}/address/${address}`;
}

/**
 * Format a transaction hash for display (first 6 and last 4 characters)
 */
export function formatTransactionHash(hash: string): string {
  if (!hash || hash.length < 10) {
    return hash;
  }
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

/**
 * Format a timestamp to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp * 1000; // Convert to milliseconds

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
}

/**
 * Format a timestamp to local date/time string
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
}

/**
 * Format a value from wei to a readable format
 */
export function formatValue(value: string, decimals = 18): string {
  try {
    const valueInWei = BigInt(value);
    const valueInEth = Number(valueInWei) / Math.pow(10, decimals);

    if (valueInEth === 0) {
      return '0';
    }
    if (valueInEth < 0.001) {
      return '< 0.001';
    }

    return valueInEth.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6
    });
  } catch (error) {
    console.warn('Error formatting value:', error);
    return '0';
  }
}

/**
 * Get transaction status from explorer response
 */
export function getTransactionStatus(
  isError: string,
  txReceiptStatus: string
): 'success' | 'failure' | 'pending' {
  if (isError === '1') {
    return 'failure';
  }
  if (txReceiptStatus === '0') {
    return 'failure';
  }
  if (txReceiptStatus === '1') {
    return 'success';
  }
  return 'pending';
}

/**
 * Determine transaction type based on addresses and contract interaction
 */
export function getTransactionType(
  from: string,
  to: string,
  connectedAddress: string,
  contractAddress?: string,
  input?: string
): 'sent' | 'received' | 'contract' {
  // Check if it's contract creation
  if (!to || to === '0x') {
    return 'contract';
  }

  // Check if it's a contract interaction
  if (contractAddress || (input && input !== '0x')) {
    return 'contract';
  }

  // Check if we sent the transaction
  if (from.toLowerCase() === connectedAddress.toLowerCase()) {
    return 'sent';
  }

  // Otherwise we received it
  return 'received';
}