import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { useContractRead } from './useContractRead';
import { useContractWrite } from './useContractWrite';
import { type ContractConfig, type TokenBalance, type ContractCallResult } from '../types/contracts';

/**
 * Hook for reading ERC-20 token balance
 * @param tokenConfig - ERC-20 token contract configuration
 * @param address - Address to check balance for (defaults to connected account)
 * @returns Token balance with formatted value
 */
export function useERC20Balance(
  tokenConfig: ContractConfig | undefined,
  address?: `0x${string}`
): ContractCallResult<TokenBalance> {
  const { address: accountAddress } = useAccount();
  const targetAddress = address || accountAddress;

  const { data: balance, isLoading, error, refetch } = useContractRead<bigint>(
    tokenConfig,
    'balanceOf',
    targetAddress ? [targetAddress] : undefined,
    { enabled: !!targetAddress }
  );

  const { data: decimals } = useContractRead<number>(
    tokenConfig,
    'decimals',
    undefined,
    { enabled: !!tokenConfig }
  );

  const { data: symbol } = useContractRead<string>(
    tokenConfig,
    'symbol',
    undefined,
    { enabled: !!tokenConfig }
  );

  const formattedBalance: TokenBalance | undefined = balance && decimals && symbol ? {
    value: balance,
    formatted: formatUnits(balance, decimals),
    symbol,
  } : undefined;

  return {
    data: formattedBalance,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for transferring ERC-20 tokens
 * @param tokenConfig - ERC-20 token contract configuration
 * @returns Transfer function and transaction state
 */
export function useERC20Transfer(tokenConfig: ContractConfig | undefined) {
  const { write, hash, isLoading, error, reset } = useContractWrite(tokenConfig);

  const transfer = (to: `0x${string}`, amount: bigint) => {
    write('transfer', [to, amount]);
  };

  return {
    transfer,
    hash,
    isLoading,
    error,
    reset,
  };
}

/**
 * Hook for approving ERC-20 token spending
 * @param tokenConfig - ERC-20 token contract configuration
 * @returns Approve function and transaction state
 */
export function useERC20Approve(tokenConfig: ContractConfig | undefined) {
  const { write, hash, isLoading, error, reset } = useContractWrite(tokenConfig);

  const approve = (spender: `0x${string}`, amount: bigint) => {
    write('approve', [spender, amount]);
  };

  return {
    approve,
    hash,
    isLoading,
    error,
    reset,
  };
}

/**
 * Hook for checking ERC-20 allowance
 * @param tokenConfig - ERC-20 token contract configuration
 * @param owner - Token owner address
 * @param spender - Spender address
 * @returns Allowance amount
 */
export function useERC20Allowance(
  tokenConfig: ContractConfig | undefined,
  owner: `0x${string}` | undefined,
  spender: `0x${string}` | undefined
): ContractCallResult<bigint> {
  return useContractRead<bigint>(
    tokenConfig,
    'allowance',
    owner && spender ? [owner, spender] : undefined,
    { enabled: !!(owner && spender) }
  );
}