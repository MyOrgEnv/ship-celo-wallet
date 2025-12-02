import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useState } from 'react';

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function WalletConnectUI(): JSX.Element {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async (id: string): Promise<void> => {
    setError(null);
    try {
      const connector = connectors.find((c) => c.id === id) ?? connectors[0];
      await connect({ connector });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setError('Failed to connect wallet. Please try again.');
    }
  };

  if (isConnected && address) {
    return (
      <div className="wallet-card">
        <h2>Connected</h2>
        <p>Address: {shortenAddress(address)}</p>
        <button onClick={() => disconnect()}>Disconnect</button>
      </div>
    );
  }

  return (
    <div className="wallet-card">
      <h2>Connect your wallet</h2>
      <p>Select a connector to get started on Celo.</p>
      <div className="connector-list">
        {connectors.map((connector) => (
          <button
            key={connector.id}
            disabled={!connector.ready || isPending}
            onClick={() => handleConnect(connector.id)}
          >
            {connector.name}
          </button>
        ))}
      </div>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
