export type GasPriority = 'slow' | 'standard' | 'fast';

export type TransactionType = 'native' | 'erc20' | 'contract' | 'networkSwitch';

export interface GasEstimate {
  gasLimit: bigint;
  gasPrice?: bigint; // For legacy networks
  maxFeePerGas?: bigint; // EIP-1559
  maxPriorityFeePerGas?: bigint; // EIP-1559
  estimatedCostWei: bigint;
  estimatedCostCelo: number;
  estimatedCostUsd: number;
  priority: GasPriority;
}

export interface GasEstimationOptions {
  transactionType: TransactionType;
  priority: GasPriority;
  // Additional options like to, value, data for contract calls
  to?: `0x${string}`;
  value?: bigint;
  data?: `0x${string}`;
}