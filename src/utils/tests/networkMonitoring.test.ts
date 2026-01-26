import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPublicClient } from 'viem';
import {
  checkRPCEndpointHealth,
  measureResponseTime,
  fetchBlockData,
  getGasPrice,
  estimateTransactionSuccessRate,
  checkMultipleEndpoints,
  calculateAverageResponseTime,
  determineCongestionLevel
} from '../networkMonitoring';
import type { RPCEndpoint } from '../../types/network';

// Mock viem
vi.mock('viem', () => ({
  createPublicClient: vi.fn(),
  http: vi.fn()
}));

// Mock viem chains
vi.mock('viem/chains', () => ({
  celo: { id: 42220, name: 'Celo' },
  celoAlfajores: { id: 44787, name: 'Celo Alfajores' },
  celoBaklava: { id: 62320, name: 'Celo Baklava' }
}));

describe('Network Monitoring Utils', () => {
  let mockClient: any;
  let mockEndpoint: RPCEndpoint;
  let dateNowSpy: vi.SpyInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    dateNowSpy = vi.spyOn(Date, 'now');

    mockClient = {
      getBlockNumber: vi.fn(),
      getBlock: vi.fn(),
      getGasPrice: vi.fn()
    };

    vi.mocked(createPublicClient).mockReturnValue(mockClient);

    mockEndpoint = {
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
    };
  });

  afterEach(() => {
    dateNowSpy.mockRestore();
  });

  describe('checkRPCEndpointHealth', () => {
    it('should update endpoint metrics on successful health check', async () => {
      dateNowSpy.mockReturnValueOnce(1000).mockReturnValueOnce(1010);

      mockClient.getBlockNumber.mockResolvedValue(BigInt(12345678));

      await checkRPCEndpointHealth(mockEndpoint);

      expect(mockEndpoint.metrics.responseTime).toBe(10);
      expect(mockEndpoint.metrics.successRate).toBe(100);
      expect(mockEndpoint.metrics.errorCount).toBe(0);
      expect(mockEndpoint.status).toBe('healthy');
      expect(mockEndpoint.isActive).toBe(true);
    });

    it('should update endpoint metrics on failed health check', async () => {
      dateNowSpy.mockReturnValueOnce(1000).mockReturnValueOnce(1010);

      mockClient.getBlockNumber.mockRejectedValue(new Error('Network error'));

      await checkRPCEndpointHealth(mockEndpoint);

      expect(mockEndpoint.metrics.responseTime).toBe(10);
      expect(mockEndpoint.metrics.successRate).toBe(0);
      expect(mockEndpoint.metrics.errorCount).toBe(1);
      expect(mockEndpoint.status).toBe('down');
      expect(mockEndpoint.isActive).toBe(false);
    });
  });

  describe('measureResponseTime', () => {
    it('should return response time for successful call', async () => {
      dateNowSpy.mockReturnValueOnce(1000).mockReturnValueOnce(1010);

      mockClient.getBlockNumber.mockResolvedValue(BigInt(12345678));

      const responseTime = await measureResponseTime(mockEndpoint);

      expect(responseTime).toBe(10);
      expect(typeof responseTime).toBe('number');
    });

    it('should return response time for failed call', async () => {

      dateNowSpy.mockReturnValueOnce(1000).mockReturnValueOnce(1010);

      mockClient.getBlockNumber.mockRejectedValue(new Error('Network error'));

      const responseTime = await measureResponseTime(mockEndpoint);

      expect(responseTime).toBe(10);

      expect(typeof responseTime).toBe('number');

    });
  });

  describe('fetchBlockData', () => {
    it('should fetch block data successfully', async () => {
      const mockBlock = { number: BigInt(12345678), timestamp: BigInt(1234567890) };
      mockClient.getBlockNumber.mockResolvedValue(BigInt(12345678));
      mockClient.getBlock.mockResolvedValue(mockBlock);

      const blocks = await fetchBlockData(mockEndpoint, 3);

      expect(blocks).toHaveLength(3);
      expect(mockClient.getBlock).toHaveBeenCalledTimes(3);
    });

    it('should throw error on failure', async () => {
      mockClient.getBlockNumber.mockRejectedValue(new Error('Network error'));

      await expect(fetchBlockData(mockEndpoint)).rejects.toThrow('Failed to fetch block data');
    });
  });

  describe('getGasPrice', () => {
    it('should return gas price successfully', async () => {
      const gasPrice = BigInt('20000000000');
      mockClient.getGasPrice.mockResolvedValue(gasPrice);

      const result = await getGasPrice(mockEndpoint);

      expect(result).toBe(gasPrice);
    });

    it('should throw error on failure', async () => {
      mockClient.getGasPrice.mockRejectedValue(new Error('Network error'));

      await expect(getGasPrice(mockEndpoint)).rejects.toThrow('Failed to get gas price');
    });
  });

  describe('estimateTransactionSuccessRate', () => {
    it('should estimate success rate based on transaction count', async () => {
      const mockBlock = {
        transactions: Array(10).fill({}) // 10 transactions
      };
      mockClient.getBlock.mockResolvedValue(mockBlock);

      const rate = await estimateTransactionSuccessRate(mockEndpoint);

      expect(rate).toBe(100); // 10 * 10 = 100, capped at 100
    });

    it('should throw error on failure', async () => {
      mockClient.getBlock.mockRejectedValue(new Error('Network error'));

      await expect(estimateTransactionSuccessRate(mockEndpoint)).rejects.toThrow('Failed to estimate success rate');
    });
  });

  describe('checkMultipleEndpoints', () => {
    it('should check all endpoints', async () => {
      const endpoint2 = { ...mockEndpoint, url: 'https://backup.rpc.celo.org' };
      mockClient.getBlockNumber.mockResolvedValue(BigInt(12345678));

      await checkMultipleEndpoints([mockEndpoint, endpoint2]);

      expect(mockClient.getBlockNumber).toHaveBeenCalledTimes(2);
    });
  });

  describe('calculateAverageResponseTime', () => {
    it('should calculate average response time', () => {
      const metrics = [
        { responseTime: 100, successRate: 100, lastChecked: new Date(), errorCount: 0 },
        { responseTime: 200, successRate: 100, lastChecked: new Date(), errorCount: 0 },
        { responseTime: 300, successRate: 100, lastChecked: new Date(), errorCount: 0 }
      ];

      const average = calculateAverageResponseTime(metrics);

      expect(average).toBe(200);
    });

    it('should return 0 for empty metrics', () => {
      const average = calculateAverageResponseTime([]);

      expect(average).toBe(0);
    });
  });

  describe('determineCongestionLevel', () => {
    it('should return high congestion for high gas price', () => {
      const gasPrice = BigInt('150000000000'); // 150 gwei
      const responseTime = 1000;

      const level = determineCongestionLevel(gasPrice, responseTime);

      expect(level).toBe('high');
    });

    it('should return high congestion for high response time', () => {
      const gasPrice = BigInt('10000000000'); // 10 gwei
      const responseTime = 6000;

      const level = determineCongestionLevel(gasPrice, responseTime);

      expect(level).toBe('high');
    });

    it('should return medium congestion', () => {
      const gasPrice = BigInt('60000000000'); // 60 gwei
      const responseTime = 3000;

      const level = determineCongestionLevel(gasPrice, responseTime);

      expect(level).toBe('medium');
    });

    it('should return low congestion', () => {
      const gasPrice = BigInt('20000000000'); // 20 gwei
      const responseTime = 1000;

      const level = determineCongestionLevel(gasPrice, responseTime);

      expect(level).toBe('low');
    });
  });

  describe('checkMultipleEndpoints fallback behavior', () => {
    it('should handle mixed success/failure scenarios', async () => {
      let callCount = 0;

      mockClient.getBlockNumber.mockImplementation(() => {

        callCount++;

        if (callCount === 1) {return Promise.resolve(BigInt(12345678));}

        return Promise.reject(new Error('Connection failed'));

      });

      const endpoint1 = { ...mockEndpoint, url: 'https://endpoint1.com' };

      const endpoint2 = { ...mockEndpoint, url: 'https://endpoint2.com' };

      await checkMultipleEndpoints([endpoint1, endpoint2]);

      expect(endpoint1.status).toBe('healthy');

      expect(endpoint1.isActive).toBe(true);

      expect(endpoint2.status).toBe('down');

      expect(endpoint2.isActive).toBe(false);

    });

    it('should continue checking all endpoints even if some fail', async () => {
      const endpoints = [
        { ...mockEndpoint, url: 'https://endpoint1.com' },
        { ...mockEndpoint, url: 'https://endpoint2.com' },
        { ...mockEndpoint, url: 'https://endpoint3.com' }
      ];

      let callCount = 0;

      mockClient.getBlockNumber.mockImplementation(() => {

        callCount++;

        if (callCount === 2) {return Promise.resolve(BigInt(12345678));}

        return Promise.reject(new Error('Fail'));

      });

      await checkMultipleEndpoints(endpoints);

      expect(endpoints[0].status).toBe('down');
      expect(endpoints[0].isActive).toBe(false);
      expect(endpoints[1].status).toBe('healthy');
      expect(endpoints[1].isActive).toBe(true);
      expect(endpoints[2].status).toBe('down');
      expect(endpoints[2].isActive).toBe(false);
    });

    it('should update error counts appropriately', async () => {
      let callCount = 0;

      mockClient.getBlockNumber.mockImplementation(() => {

        callCount++;

        if (callCount === 1) {return Promise.reject(new Error('Fail'));}

        return Promise.resolve(BigInt(12345678));

      });

      const endpoint = { ...mockEndpoint, metrics: { ...mockEndpoint.metrics, errorCount: 0 } };

      await checkRPCEndpointHealth(endpoint);

      expect(endpoint.metrics.errorCount).toBe(1);

      await checkRPCEndpointHealth(endpoint);

      expect(endpoint.metrics.errorCount).toBe(0); // Reset on success

    });

    it('should maintain endpoint status consistency', async () => {

      let callCount = 0;

      mockClient.getBlockNumber.mockImplementation(() => {

        callCount++;

        if (callCount === 1) {return Promise.reject(new Error('Fail'));}

        return Promise.resolve(BigInt(12345678));

      });

      const endpoint = { ...mockEndpoint };

      await checkRPCEndpointHealth(endpoint);

      expect(endpoint.status).toBe('down');

      expect(endpoint.isActive).toBe(false);

      expect(endpoint.metrics.successRate).toBe(0);

      await checkRPCEndpointHealth(endpoint);

      expect(endpoint.status).toBe('healthy');

      expect(endpoint.isActive).toBe(true);

      expect(endpoint.metrics.successRate).toBe(100);

    });
  });
});