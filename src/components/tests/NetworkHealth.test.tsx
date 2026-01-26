import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NetworkHealth } from '../NetworkHealth';

// Mock the useNetworkHealth hook
vi.mock('../../hooks/useNetworkHealth', () => ({
  useNetworkHealth: vi.fn()
}));

import { useNetworkHealth } from '../../hooks/useNetworkHealth';
import type { NetworkHealthData } from '../../types/network';

describe('NetworkHealth', () => {
  let mockUseNetworkHealth: any;
  let mockEndpoints: any[];

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

    mockUseNetworkHealth = {
      data: null,
      loading: false,
      error: null
    };

    vi.mocked(useNetworkHealth).mockReturnValue(mockUseNetworkHealth);
  });

  it('should render loading state', () => {
    mockUseNetworkHealth.loading = true;

    render(<NetworkHealth endpoints={mockEndpoints} />);

    expect(screen.getByText('Loading network health...')).toBeInTheDocument();
  });

  it('should render error state', () => {
    mockUseNetworkHealth.error = new Error('Test error');

    render(<NetworkHealth endpoints={mockEndpoints} />);

    expect(screen.getByText('An unexpected error occurred while monitoring network health. Please try again later or contact support if the issue persists.')).toBeInTheDocument();
  });

  it('should render empty state when no data', () => {
    render(<NetworkHealth endpoints={mockEndpoints} />);

    expect(screen.getByText('No network health data available.')).toBeInTheDocument();
  });

  it('should render network health data', () => {
    const mockData: NetworkHealthData = {
      chainId: 42220,
      status: 'healthy',
      congestionLevel: 'low',
      metrics: {
        rpcResponseTime: 150,
        transactionSuccessRate: 95,
        blockProductionTime: 5.2,
        gasPriceTrend: 'stable',
        connectedPeerCount: 10,
        lastBlockNumber: 12345678,
        timestamp: new Date()
      },
      rpcEndpoints: mockEndpoints,
      lastUpdated: new Date()
    };

    mockUseNetworkHealth.data = mockData;

    render(<NetworkHealth endpoints={mockEndpoints} />);

    expect(screen.getByText('Network Health Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Network Status: Healthy')).toBeInTheDocument();
    expect(screen.getByText('Congestion Level: Low')).toBeInTheDocument();
    expect(screen.getByText('150 ms')).toBeInTheDocument();
    expect(screen.getByText('5.2 s')).toBeInTheDocument();
    expect(screen.getByText('95.1%')).toBeInTheDocument();
    expect(screen.getByText('Stable')).toBeInTheDocument();
    expect(screen.getByText('12345678')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('RPC Endpoints')).toBeInTheDocument();
    expect(screen.getByText('https://rpc.celo.org - healthy')).toBeInTheDocument();
  });

  it('should render different status colors', () => {
    const mockData: NetworkHealthData = {
      chainId: 42220,
      status: 'degraded',
      congestionLevel: 'medium',
      metrics: {
        rpcResponseTime: 150,
        transactionSuccessRate: 95,
        blockProductionTime: 5.2,
        gasPriceTrend: 'increasing',
        connectedPeerCount: 10,
        lastBlockNumber: 12345678,
        timestamp: new Date()
      },
      rpcEndpoints: [
        {
          ...mockEndpoints[0],
          status: 'degraded'
        }
      ],
      lastUpdated: new Date()
    };

    mockUseNetworkHealth.data = mockData;

    render(<NetworkHealth endpoints={mockEndpoints} />);

    expect(screen.getByText('Network Status: Degraded')).toBeInTheDocument();
    expect(screen.getByText('Congestion Level: Medium')).toBeInTheDocument();
    expect(screen.getByText('Increasing')).toBeInTheDocument();
    expect(screen.getByText('https://rpc.celo.org - degraded')).toBeInTheDocument();
  });

  it('should render down status', () => {
    const mockData: NetworkHealthData = {
      chainId: 42220,
      status: 'down',
      congestionLevel: 'high',
      metrics: {
        rpcResponseTime: 150,
        transactionSuccessRate: 95,
        blockProductionTime: 5.2,
        gasPriceTrend: 'decreasing',
        connectedPeerCount: 10,
        lastBlockNumber: 12345678,
        timestamp: new Date()
      },
      rpcEndpoints: [
        {
          ...mockEndpoints[0],
          status: 'down'
        }
      ],
      lastUpdated: new Date()
    };

    mockUseNetworkHealth.data = mockData;

    render(<NetworkHealth endpoints={mockEndpoints} />);

    expect(screen.getByText('Network Status: Down')).toBeInTheDocument();
    expect(screen.getByText('Congestion Level: High')).toBeInTheDocument();
    expect(screen.getByText('Decreasing')).toBeInTheDocument();
    expect(screen.getByText('https://rpc.celo.org - down')).toBeInTheDocument();
  });

  it('should display last updated timestamp and cache info', () => {
    const lastUpdated = new Date('2023-01-01T12:00:00Z');
    const mockData: NetworkHealthData = {
      chainId: 42220,
      status: 'healthy',
      congestionLevel: 'low',
      metrics: {
        rpcResponseTime: 150,
        transactionSuccessRate: 95,
        blockProductionTime: 5.2,
        gasPriceTrend: 'stable',
        connectedPeerCount: 10,
        lastBlockNumber: 12345678,
        timestamp: new Date()
      },
      rpcEndpoints: mockEndpoints,
      lastUpdated
    };

    mockUseNetworkHealth.data = mockData;

    render(<NetworkHealth endpoints={mockEndpoints} />);

    expect(screen.getByText(`Last updated: ${lastUpdated.toLocaleString()}`)).toBeInTheDocument();
    expect(screen.getByText(/Data cached for \d+s \(refreshes every 30s\)/)).toBeInTheDocument();
  });

  it('should render congestion bar width correctly', () => {
    const mockData: NetworkHealthData = {
      chainId: 42220,
      status: 'healthy',
      congestionLevel: 'medium',
      metrics: {
        rpcResponseTime: 150,
        transactionSuccessRate: 95,
        blockProductionTime: 5.2,
        gasPriceTrend: 'stable',
        connectedPeerCount: 10,
        lastBlockNumber: 12345678,
        timestamp: new Date()
      },
      rpcEndpoints: mockEndpoints,
      lastUpdated: new Date()
    };

    mockUseNetworkHealth.data = mockData;

    render(<NetworkHealth endpoints={mockEndpoints} />);

    const congestionBar = screen.getByRole('progressbar'); // Assuming the div with width is treated as progressbar
    expect(congestionBar).toHaveStyle({ width: '66%' });
  });

  it('should display user-friendly error messages', () => {
    mockUseNetworkHealth.error = new Error('network connection failed');

    render(<NetworkHealth endpoints={mockEndpoints} />);

    expect(screen.getByText('Network connection error. Please check your internet connection and try again.')).toBeInTheDocument();
  });

  it('should display timeout error message', () => {
    mockUseNetworkHealth.error = new Error('Request timeout occurred');

    render(<NetworkHealth endpoints={mockEndpoints} />);

    expect(screen.getByText('Request timed out. The network may be experiencing high congestion. Try refreshing or switching networks.')).toBeInTheDocument();
  });

  it('should display RPC endpoint error message', () => {
    mockUseNetworkHealth.error = new Error('All RPC endpoints are down');

    render(<NetworkHealth endpoints={mockEndpoints} />);

    expect(screen.getByText('RPC endpoint error. Some network endpoints may be temporarily unavailable. The system will automatically try alternative endpoints.')).toBeInTheDocument();
  });

  it('should display gas price error message', () => {
    mockUseNetworkHealth.error = new Error('Failed to get gas price');

    render(<NetworkHealth endpoints={mockEndpoints} />);

    expect(screen.getByText('Gas price retrieval failed. Transaction cost estimation may be unavailable.')).toBeInTheDocument();
  });

  it('should display fetch error message', () => {
    mockUseNetworkHealth.error = new Error('Failed to fetch data');

    render(<NetworkHealth endpoints={mockEndpoints} />);

    expect(screen.getByText('Data fetch error. Network monitoring data could not be retrieved. Please check your connection.')).toBeInTheDocument();
  });

  it('should display generic error message for unknown errors', () => {
    mockUseNetworkHealth.error = new Error('Some unexpected error');

    render(<NetworkHealth endpoints={mockEndpoints} />);

    expect(screen.getByText('An unexpected error occurred while monitoring network health. Please try again later or contact support if the issue persists.')).toBeInTheDocument();
  });
});