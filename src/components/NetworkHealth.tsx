import { useState, useEffect } from 'react';
import { useNetworkHealth } from '../hooks/useNetworkHealth';
import { ErrorRecovery } from './ErrorRecovery';
import type { RPCEndpoint } from '../types/network';

interface NetworkHealthProps {
  /** Array of RPC endpoints to monitor for network health */
  endpoints: RPCEndpoint[];
}

/**
 * Formats error messages into user-friendly descriptions based on error content.
 * @param error - The error object to format
 * @returns A user-friendly error message string
 */
function formatErrorMessage(error: Error): string {
  const message = error.message.toLowerCase();

  if (message.includes('network') || message.includes('connection')) {
    return 'Network connection error. Please check your internet connection and try again.';
  }

  if (message.includes('timeout')) {
    return 'Request timed out. The network may be experiencing high congestion. Try refreshing or switching networks.';
  }

  if (message.includes('rpc') || message.includes('endpoint')) {
    return 'RPC endpoint error. Some network endpoints may be temporarily unavailable. The system will automatically try alternative endpoints.';
  }

  if (message.includes('block') || message.includes('chain')) {
    return 'Blockchain data error. Unable to retrieve current network information. This may be due to temporary node issues.';
  }

  if (message.includes('gas') || message.includes('price')) {
    return 'Gas price retrieval failed. Transaction cost estimation may be unavailable.';
  }

  if (message.includes('fetch') || message.includes('request')) {
    return 'Data fetch error. Network monitoring data could not be retrieved. Please check your connection.';
  }

  return 'An unexpected error occurred while monitoring network health. Please try again later or contact support if the issue persists.';
}

/**
 * NetworkHealth component displays real-time Celo network health information.
 *
 * This component monitors RPC endpoints, displays network status, congestion levels,
 * response times, and other key metrics. It provides visual indicators for network
 * health and shows user-friendly error messages when issues occur.
 *
 * Features:
 * - Real-time network status monitoring
 * - Congestion level visualization
 * - RPC endpoint health checks
 * - Automatic error handling with descriptive messages
 * - Cached data to reduce API calls
 *
 * @param props - Component props
 * @param props.endpoints - Array of RPC endpoints to monitor
 * @returns JSX element displaying network health dashboard
 *
 * @example
 * ```tsx
 * <NetworkHealth endpoints={celoEndpoints} />
 * ```
 */
export function NetworkHealth({ endpoints }: NetworkHealthProps) {
  const { data, loading, error } = useNetworkHealth({ endpoints, interval: 30000, cacheTimeout: 15000 });

  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="wallet-card">
        <div className="loading-state">
          <div className="loading-spinner" style={{ border: '2px solid rgba(255,255,255,0.1)', borderTop: '2px solid #60a5fa', borderRadius: '50%' }}></div>
          Loading network health...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wallet-card">
        <div className="error-state">
          <p>{formatErrorMessage(error)}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="wallet-card">
        <div className="empty-state">
          <p>No network health data available.</p>
        </div>
      </div>
    );
  }

  const { status, congestionLevel, metrics, lastUpdated } = data;

  const getStatusColor = (status: string) => {
    switch (status) {
    case 'healthy': return '#22c55e';
    case 'degraded': return '#f59e0b';
    case 'down': return '#ef4444';
    default: return '#6b7280';
    }
  };

  const getCongestionWidth = (level: string) => {
    switch (level) {
    case 'low': return '33%';
    case 'medium': return '66%';
    case 'high': return '100%';
    default: return '0%';
    }
  };

  return (
    <div className="wallet-card">
      <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Network Health Dashboard</h3>

      {/* Network Status */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: getStatusColor(status)
            }}
          ></div>
          <span>Network Status: {status.charAt(0).toUpperCase() + status.slice(1)}</span>
        </div>
      </div>

      {/* Congestion Level */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ marginBottom: '0.5rem' }}>Congestion Level: {congestionLevel.charAt(0).toUpperCase() + congestionLevel.slice(1)}</div>
        <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
          <div
            style={{
              width: getCongestionWidth(congestionLevel),
              height: '100%',
              backgroundColor: congestionLevel === 'high' ? '#ef4444' : congestionLevel === 'medium' ? '#f59e0b' : '#22c55e',
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }}
          ></div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)' }}>RPC Response Time</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{metrics.rpcResponseTime.toFixed(0)} ms</div>
        </div>
        <div>
          <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)' }}>Block Production Time</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{metrics.blockProductionTime.toFixed(2)} s</div>
        </div>
        <div>
          <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)' }}>Transaction Success Rate</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{metrics.transactionSuccessRate.toFixed(1)}%</div>
        </div>
        <div>
          <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)' }}>Gas Price Trend</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{metrics.gasPriceTrend.charAt(0).toUpperCase() + metrics.gasPriceTrend.slice(1)}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)' }}>Last Block Number</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{metrics.lastBlockNumber}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)' }}>Connected Peers</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{metrics.connectedPeerCount}</div>
        </div>
      </div>

      {/* RPC Endpoints */}
      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ marginBottom: '0.5rem' }}>RPC Endpoints</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {data.rpcEndpoints.map((endpoint, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: getStatusColor(endpoint.status)
                }}
              ></div>
              <span style={{ fontSize: '0.875rem' }}>{endpoint.url} - {endpoint.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cache and Last Updated */}
      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: '1rem' }}>
        <div>Last updated: {lastUpdated.toLocaleString()}</div>
        <div style={{ marginTop: '0.25rem' }}>
          Data cached for {Math.round((currentTime - lastUpdated.getTime()) / 1000)}s (refreshes every 30s)
        </div>
      </div>
    </div>
  );
};

export default NetworkHealth;