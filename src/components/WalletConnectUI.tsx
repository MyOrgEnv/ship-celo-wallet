import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useState } from 'react';
import { ErrorRecovery } from './ErrorRecovery';

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function WalletConnectUI(): React.ReactElement {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [error, setError] = useState<Error | null>(null);

  const handleConnect = async (id: string): Promise<void> => {
    setError(null);
    try {
      const connector = connectors.find((c) => c.id === id) ?? connectors[0];
      if (!connector) {
        setError(new Error('No connector available. Please refresh the page and try again.'));
        return;
      }
      await connect({ connector });
    } catch (e) {
      console.error('Wallet connection failed:', e);
      setError(new Error('Failed to connect wallet. Please try again.'));
    }
  };

  const handleDisconnect = (): void => {
    try {
      disconnect();
      setError(null);
    } catch (e) {
      console.error('Wallet disconnection failed:', e);
      setError(new Error('Failed to disconnect wallet. Please try again.'));
    }
  };

  if (isConnected && address) {
    return (
      <div className="wallet-card">
        <h2>Connected</h2>
        <p>Address: {shortenAddress(address)}</p>
        <button onClick={handleDisconnect}>Disconnect</button>
      </div>
    );
  }

  return (
    <div className="wallet-card">
      <h2>Connect your wallet</h2>
      <p>Select a connector to get started on Celo.</p>
      {connectors.every(c => !c.ready) && !error && <ErrorRecovery error={new Error('No wallet extensions detected. Please install a compatible wallet extension.')} context="wallet detection" onRetry={() => window.location.reload()} onRecovered={() => {}} />}
      {connectors.some(c => c.ready) && !error && <div className="connector-list">
        {connectors.map((connector) => (
          <button
            key={connector.id}
            disabled={!connector.ready || isPending}
            onClick={() => handleConnect(connector.id)}
          >
            {connector.name}
          </button>
        ))}
      </div>}
      {error && <ErrorRecovery error={error} context="wallet connection" onRetry={() => handleConnect(connectors[0]?.id || '')} onRecovered={() => setError(null)} />}
    </div>
  );
}
