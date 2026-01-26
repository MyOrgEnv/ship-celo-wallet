import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNetworkHealth } from '../useNetworkHealth';

// Mock the useCeloNetwork hook
vi.mock('../../hooks/useCeloNetwork', () => ({
  useCeloNetwork: vi.fn()
}));

// Mock the network monitoring utilities
vi.mock('../../utils/networkMonitoring', () => ({
  checkMultipleEndpoints: vi.fn(),
  calculateAverageResponseTime: vi.fn(),
  determineCongestionLevel: vi.fn(),
  fetchBlockData: vi.fn(),
  getGasPrice: vi.fn(),
  estimateTransactionSuccessRate: vi.fn()
}));

import { useCeloNetwork } from '../../hooks/useCeloNetwork';
import {
  checkMultipleEndpoints,
  calculateAverageResponseTime,
  determineCongestionLevel,
  fetchBlockData,
  getGasPrice,
  estimateTransactionSuccessRate
} from '../../utils/networkMonitoring';

describe('useNetworkHealth', () => {
  let mockEndpoints: any[];
  let mockUseCeloNetwork: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockEndpoints = [
      {
        url: 'https://rpc.celo.org',
        chainId: 42220,
        status: 'healthy',
        metrics: {
          responseTime: 100,
          successRate: 100,
          lastChecked: new Date(),
          errorCount: 0
        },
        isActive: true
      }
    ];

    mockUseCeloNetwork = {
      currentChainId: 42220
    };

    vi.mocked(useCeloNetwork).mockReturnValue(mockUseCeloNetwork);

    // Default successful mocks
    vi.mocked(checkMultipleEndpoints).mockResolvedValue(undefined);
    vi.mocked(calculateAverageResponseTime).mockReturnValue(150);
    vi.mocked(determineCongestionLevel).mockReturnValue('low');
    vi.mocked(fetchBlockData).mockResolvedValue([
      { number: BigInt(12345678), timestamp: BigInt(1234567890) },
      { number: BigInt(12345677), timestamp: BigInt(1234567880) }
    ]);
    vi.mocked(getGasPrice).mockResolvedValue(BigInt('20000000000'));
    vi.mocked(estimateTransactionSuccessRate).mockResolvedValue(95);
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useNetworkHealth({ endpoints: mockEndpoints }));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should fetch health data successfully', async () => {
    const { result } = renderHook(() => useNetworkHealth({ endpoints: mockEndpoints }));

    // Wait for the effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeDefined();
    expect(result.current.data?.chainId).toBe(42220);
    expect(result.current.data?.status).toBe('healthy');
    expect(result.current.data?.congestionLevel).toBe('low');
  });

  it('should handle error during health check', async () => {
    vi.mocked(checkMultipleEndpoints).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useNetworkHealth({ endpoints: mockEndpoints }));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Network error');
    expect(result.current.data).toBeNull();
  });

  it('should filter endpoints by current chain ID', async () => {
    const mixedEndpoints = [
      ...mockEndpoints,
      {
        ...mockEndpoints[0],
        chainId: 44787 // Different chain
      }
    ];

    const { result } = renderHook(() => useNetworkHealth({ endpoints: mixedEndpoints }));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(vi.mocked(checkMultipleEndpoints)).toHaveBeenCalledWith(mockEndpoints); // Only 42220 endpoints
  });

  it('should handle no endpoints for current chain', async () => {
    mockUseCeloNetwork.currentChainId = 99999; // Unsupported chain

    const { result } = renderHook(() => useNetworkHealth({ endpoints: mockEndpoints }));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();
    expect(vi.mocked(checkMultipleEndpoints)).not.toHaveBeenCalled();
  });

  it('should calculate metrics correctly', async () => {
    const { result } = renderHook(() => useNetworkHealth({ endpoints: mockEndpoints }));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const data = result.current.data!;
    expect(data.metrics.rpcResponseTime).toBe(150);
    expect(data.metrics.transactionSuccessRate).toBe(95);
    expect(data.metrics.blockProductionTime).toBeCloseTo(10, 1); // Based on mock timestamps
    expect(data.metrics.lastBlockNumber).toBe(12345678);
  });

  it('should determine network status based on endpoint health', async () => {
    // All healthy
    const { result } = renderHook(() => useNetworkHealth({ endpoints: mockEndpoints }));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.data?.status).toBe('healthy');
  });

  it('should handle custom interval', () => {
    vi.useFakeTimers();

    renderHook(() => useNetworkHealth({ endpoints: mockEndpoints, interval: 5000 }));

    // Initial call
    expect(vi.mocked(checkMultipleEndpoints)).toHaveBeenCalledTimes(1);

    // Advance time
    vi.advanceTimersByTime(5000);

    expect(vi.mocked(checkMultipleEndpoints)).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });

  it('should use cached data when within cache timeout', async () => {
    const { result } = renderHook(() => useNetworkHealth({ endpoints: mockEndpoints, cacheTimeout: 5000 }));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Should have fetched once
    expect(vi.mocked(checkMultipleEndpoints)).toHaveBeenCalledTimes(1);

    // Wait less than cache timeout and trigger again
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Should not have fetched again due to cache
    expect(vi.mocked(checkMultipleEndpoints)).toHaveBeenCalledTimes(1);
  });

  it('should fallback to next active endpoint when first fails', async () => {
    const fallbackEndpoints = [
      {
        url: 'https://failing.rpc.celo.org',
        chainId: 42220,
        status: 'healthy' as const,
        metrics: {
          responseTime: 100,
          successRate: 100,
          lastChecked: new Date(),
          errorCount: 0
        },
        isActive: true
      },
      {
        url: 'https://working.rpc.celo.org',
        chainId: 42220,
        status: 'healthy' as const,
        metrics: {
          responseTime: 200,
          successRate: 95,
          lastChecked: new Date(),
          errorCount: 0
        },
        isActive: true
      }
    ];

    // First endpoint fails, second succeeds
    vi.mocked(getGasPrice).mockImplementation((endpoint: any) => {
      if (endpoint.url === 'https://failing.rpc.celo.org') {
        return Promise.reject(new Error('Connection failed'));
      }
      return Promise.resolve(BigInt('20000000000'));
    });

    vi.mocked(estimateTransactionSuccessRate).mockImplementation((endpoint: any) => {
      if (endpoint.url === 'https://failing.rpc.celo.org') {
        return Promise.reject(new Error('Connection failed'));
      }
      return Promise.resolve(95);
    });

    vi.mocked(fetchBlockData).mockImplementation((endpoint: any) => {
      if (endpoint.url === 'https://failing.rpc.celo.org') {
        return Promise.reject(new Error('Connection failed'));
      }
      return Promise.resolve([
        { number: BigInt(12345678), timestamp: BigInt(1234567890) },
        { number: BigInt(12345677), timestamp: BigInt(1234567880) }
      ]);
    });

    const { result } = renderHook(() => useNetworkHealth({ endpoints: fallbackEndpoints }));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeDefined();
    expect(result.current.data?.chainId).toBe(42220);

    // Verify that getGasPrice was called for both endpoints (first failed, second succeeded)
    expect(vi.mocked(getGasPrice)).toHaveBeenCalledTimes(2);
    expect(vi.mocked(getGasPrice)).toHaveBeenCalledWith(fallbackEndpoints[0]);
    expect(vi.mocked(getGasPrice)).toHaveBeenCalledWith(fallbackEndpoints[1]);
  });

  it('should handle all active endpoints failing', async () => {
    const failingEndpoints = [
      {
        url: 'https://failing1.rpc.celo.org',
        chainId: 42220,
        status: 'healthy' as const,
        metrics: {
          responseTime: 100,
          successRate: 100,
          lastChecked: new Date(),
          errorCount: 0
        },
        isActive: true
      },
      {
        url: 'https://failing2.rpc.celo.org',
        chainId: 42220,
        status: 'healthy' as const,
        metrics: {
          responseTime: 200,
          successRate: 95,
          lastChecked: new Date(),
          errorCount: 0
        },
        isActive: true
      }
    ];

    // All endpoints fail
    vi.mocked(getGasPrice).mockRejectedValue(new Error('All connections failed'));
    vi.mocked(estimateTransactionSuccessRate).mockRejectedValue(new Error('All connections failed'));
    vi.mocked(fetchBlockData).mockRejectedValue(new Error('All connections failed'));

    const { result } = renderHook(() => useNetworkHealth({ endpoints: failingEndpoints }));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('All connections failed');
    expect(result.current.data).toBeNull();
  });

  it('should refetch when cache timeout expires', async () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useNetworkHealth({ endpoints: mockEndpoints, cacheTimeout: 2000 }));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(vi.mocked(checkMultipleEndpoints)).toHaveBeenCalledTimes(1);

    // Advance time past cache timeout
    vi.advanceTimersByTime(3000);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(vi.mocked(checkMultipleEndpoints)).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });

  it('should handle fallback when primary endpoint fails', async () => {
    const failingEndpoint = {
      ...mockEndpoints[0],
      status: 'down',
      isActive: false
    };
    const workingEndpoint = {
      ...mockEndpoints[1],
      status: 'healthy',
      isActive: true
    };

    const mixedEndpoints = [failingEndpoint, workingEndpoint];

    const { result } = renderHook(() => useNetworkHealth({ endpoints: mixedEndpoints }));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.data?.status).toBe('healthy'); // Should be healthy because one endpoint works
    expect(result.current.data?.rpcEndpoints).toHaveLength(2);
  });

  it('should mark network as down when all endpoints fail', async () => {
    const failingEndpoints = mockEndpoints.map(endpoint => ({
      ...endpoint,
      status: 'down' as const,
      isActive: false
    }));

    const { result } = renderHook(() => useNetworkHealth({ endpoints: failingEndpoints }));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.data?.status).toBe('down');
  });

  it('should calculate metrics using active endpoints only', async () => {
    const mixedEndpoints = [
      { ...mockEndpoints[0], status: 'down' as const, isActive: false, metrics: { responseTime: 0, successRate: 0, lastChecked: new Date(), errorCount: 1 } },
      { ...mockEndpoints[1], status: 'healthy' as const, isActive: true, metrics: { responseTime: 100, successRate: 100, lastChecked: new Date(), errorCount: 0 } }
    ];

    vi.mocked(calculateAverageResponseTime).mockReturnValue(100); // Should use only active endpoint

    const { result } = renderHook(() => useNetworkHealth({ endpoints: mixedEndpoints }));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(vi.mocked(calculateAverageResponseTime)).toHaveBeenCalledWith([mixedEndpoints[1].metrics]); // Only active endpoint metrics
  });
});