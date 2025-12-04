import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTransactionHistory } from '../useTransactionHistory';

// Mock wagmi hooks
vi.mock('wagmi', () => ({
  useAccount: () => ({
    address: '0x1234567890123456789012345678901234567890',
    isConnected: true
  }),
  useChainId: () => 42220
}));

// Mock viem
vi.mock('viem', () => ({
  createPublicClient: vi.fn(() => ({
    getBlockNumber: vi.fn().mockResolvedValue(BigInt(12345678)),
    getBlock: vi.fn().mockResolvedValue({
      transactions: [
        {
          hash: '0x1234567890abcdef',
          from: '0x1234567890123456789012345678901234567890',
          to: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
          value: BigInt('1000000000000000000'),
          blockNumber: BigInt(12345678),
          gasPrice: BigInt('20000000000')
        }
      ]
    }),
    getTransactionReceipt: vi.fn().mockResolvedValue({
      status: 'success',
      gasUsed: BigInt('21000')
    })
  }))
}));

// Mock the celo chains config
vi.mock('../../config/celoChains', () => ({
  celo: {
    id: 42220,
    name: 'Celo',
    rpcUrls: {
      default: {
        http: ['https://rpc.celo.org']
      }
    }
  },
  celoAlfajores: {
    id: 44787,
    name: 'Celo Alfajores',
    rpcUrls: {
      default: {
        http: ['https://alfajores-forno.celo-testnet.org']
      }
    }
  }
}));

describe('useTransactionHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useTransactionHistory());

    expect(result.current.address).toBe('0x1234567890123456789012345678901234567890');
    expect(result.current.chainId).toBe(42220);
    expect(result.current.isConnected).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should throw error when no address is available', async () => {
    vi.mocked(useAccount).mockReturnValue({
      address: undefined,
      isConnected: true
    });

    const { result } = renderHook(() => useTransactionHistory());

    await act(async () => {
      try {
        await result.current.fetchTransactions({ limit: 10 });
        expect(false).toBe(true); // Should have thrown
      } catch (error) {
        expect(error).toEqual({
          message: 'No wallet address available',
          code: 'NO_ADDRESS'
        });
      }
    });
  });

  it('should fetch transactions successfully', async () => {
    const { result } = renderHook(() => useTransactionHistory());

    await act(async () => {
      const data = await result.current.fetchTransactions({ limit: 10 });
      expect(data).toEqual({
        transactions: expect.any(Array),
        total: expect.any(Number),
        hasMore: false,
        nextCursor: undefined
      });
    });
  });

  it('should refresh transactions', async () => {
    const { result } = renderHook(() => useTransactionHistory());

    await act(async () => {
      const data = await result.current.refreshTransactions(undefined, 10);
      expect(data).toEqual({
        transactions: expect.any(Array),
        total: expect.any(Number),
        hasMore: false,
        nextCursor: undefined
      });
    });
  });

  it('should apply filters when fetching transactions', async () => {
    const { result } = renderHook(() => useTransactionHistory());

    await act(async () => {
      const data = await result.current.fetchTransactions({
        limit: 10,
        filters: {
          type: 'sent',
          status: 'success'
        }
      });
      expect(data).toEqual({
        transactions: expect.any(Array),
        total: expect.any(Number),
        hasMore: false,
        nextCursor: undefined
      });
    });
  });

  it('should return transaction summary', () => {
    const { result } = renderHook(() => useTransactionHistory());

    expect(result.current.transactionSummary).toEqual({
      totalSent: 0,
      totalReceived: 0,
      totalTransactions: 0,
      lastTransaction: null
    });
  });

  it('should handle network errors gracefully', async () => {
    // Mock a network error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockClient = {
      getBlockNumber: vi.fn().mockRejectedValue(new Error('Network error')),
      getBlock: vi.fn(),
      getTransactionReceipt: vi.fn()
    };

    vi.mocked(createPublicClient).mockReturnValue(mockClient);

    const { result } = renderHook(() => useTransactionHistory());

    await act(async () => {
      try {
        await result.current.fetchTransactions({ limit: 10 });
        expect(false).toBe(true); // Should have thrown
      } catch (error) {
        expect(error.message).toContain('Failed to fetch transactions');
      }
    });

    consoleSpy.mockRestore();
  });
});