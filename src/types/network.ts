// Network health monitoring types aligned with Celo chains and Wagmi integration

export type NetworkStatus = 'healthy' | 'degraded' | 'down';

export type NetworkCongestionLevel = 'low' | 'medium' | 'high';

export interface RPCHealthMetrics {
  responseTime: number; // in milliseconds
  successRate: number; // percentage (0-100)
  lastChecked: Date;
  errorCount: number;
}

export interface NetworkHealthMetrics {
  rpcResponseTime: number; // average in milliseconds
  transactionSuccessRate: number; // percentage (0-100)
  blockProductionTime: number; // average in seconds
  gasPriceTrend: 'increasing' | 'decreasing' | 'stable';
  connectedPeerCount: number;
  lastBlockNumber: number;
  timestamp: Date;
}

export interface RPCEndpoint {
  url: string;
  chainId: number; // Celo chain IDs: mainnet (42220), alfajores (44787), baklava (62320)
  status: NetworkStatus;
  metrics: RPCHealthMetrics;
  isActive: boolean;
}

export interface NetworkHealthData {
  chainId: number;
  status: NetworkStatus;
  congestionLevel: NetworkCongestionLevel;
  metrics: NetworkHealthMetrics;
  rpcEndpoints: RPCEndpoint[];
  lastUpdated: Date;
}

export interface NetworkMonitoringConfig {
  checkInterval: number; // in milliseconds
  timeout: number; // in milliseconds
  retryAttempts: number;
  alertThresholds: {
    responseTime: number;
    successRate: number;
    peerCount: number;
  };
}

export type NetworkHealthAlert = {
  type: 'rpc_failure' | 'high_congestion' | 'low_peers' | 'block_delay';
  severity: 'low' | 'medium' | 'high';
  message: string;
  chainId: number;
  timestamp: Date;
};