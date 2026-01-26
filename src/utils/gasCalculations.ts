import { type PublicClient } from 'viem';
import type { GasEstimate, GasPriority, TransactionType, GasEstimationOptions } from '../types/gas';

// Constants for gas limits based on transaction type (rough estimates)
const GAS_LIMIT_ESTIMATES: Record<TransactionType, bigint> = {
  native: 21000n, // Standard transfer
  erc20: 65000n, // ERC-20 transfer
  contract: 150000n, // Contract interaction (variable, this is a default)
  networkSwitch: 21000n, // Similar to native transfer
};

// Priority multipliers for maxPriorityFeePerGas
const PRIORITY_MULTIPLIERS: Record<GasPriority, number> = {
  slow: 0.5,
  standard: 1,
  fast: 2,
};

/**
 * Estimates gas limit for a transaction based on type and options
 */
export async function estimateGasLimit(
  client: PublicClient,
  options: GasEstimationOptions
): Promise<bigint> {
  const { transactionType, to, value, data } = options;

  if (to && value !== undefined) {
    try {
      // Use viem's estimateGas for more accurate estimation
      const estimated = await client.estimateGas({
        to,
        value,
        data: data || '0x',
      });
      return estimated;
    } catch (error) {
      console.warn('Failed to estimate gas, using fallback:', error);
    }
  }

  // Fallback to predefined estimates
  return GAS_LIMIT_ESTIMATES[transactionType];
}

/**
 * Gets fee data for a specific priority level
 */
export async function getFeeDataForPriority(
  client: PublicClient,
  priority: GasPriority
): Promise<{
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
}> {
  const [fees, maxPriorityFee] = await Promise.all([
    client.estimateFeesPerGas(),
    client.estimateMaxPriorityFeePerGas(),
  ]);

  const multiplier = PRIORITY_MULTIPLIERS[priority];
  const adjustedMaxPriorityFee = (maxPriorityFee * BigInt(Math.floor(multiplier * 100))) / 100n;

  return {
    maxFeePerGas: fees.maxFeePerGas || (fees.gasPrice! * 2n), // Fallback for legacy
    maxPriorityFeePerGas: adjustedMaxPriorityFee,
  };
}

/**
 * Calculates estimated cost in wei
 */
export function calculateEstimatedCost(
  gasLimit: bigint,
  maxFeePerGas: bigint
): bigint {
  // For EIP-1559, the cost is gasLimit * maxFeePerGas (simplified estimation)
  return gasLimit * maxFeePerGas;
}

/**
 * Converts wei to CELO (since CELO is 18 decimals like ETH)
 */
export function weiToCelo(wei: bigint): number {
  return Number(wei) / 1e18;
}

/**
 * Converts CELO amount to USD (placeholder - needs actual price fetching)
 * TODO: Integrate with price oracle
 */
export function celoToUsd(celoAmount: number, celoPriceUsd: number = 0.5): number {
  return celoAmount * celoPriceUsd;
}

/**
 * Creates a complete gas estimate
 */
export async function createGasEstimate(
  client: PublicClient,
  options: GasEstimationOptions,
  celoPriceUsd: number = 0.5 // TODO: Fetch real price
): Promise<GasEstimate> {
  const gasLimit = await estimateGasLimit(client, options);
  const feeData = await getFeeDataForPriority(client, options.priority);

  const estimatedCostWei = calculateEstimatedCost(
    gasLimit,
    feeData.maxFeePerGas
  );

  const estimatedCostCelo = weiToCelo(estimatedCostWei);
  const estimatedCostUsd = celoToUsd(estimatedCostCelo, celoPriceUsd);

  return {
    gasLimit,
    maxFeePerGas: feeData.maxFeePerGas,
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
    estimatedCostWei,
    estimatedCostCelo,
    estimatedCostUsd,
    priority: options.priority,
  };
}