import { useAccount } from 'wagmi';
import { useCeloNetwork } from '../hooks/useCeloNetwork';

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function WalletStatus(): JSX.Element {
  const { address, isConnected } = useAccount();
  const {
    activeChain,
    isSupported,
    celoMainnet,
    alfajores,
    switchToCelo,
    switchToAlfajores,
    isSwitching
  } = useCeloNetwork();

  return (
    <div className="wallet-status">
      <div className="wallet-status-main">
        {isConnected && address ? (
          <>
            <span className="pill pill-connected">Connected</span>
            <span className="pill">{shortenAddress(address)}</span>
            {activeChain && (
              <span className="pill pill-chain">{activeChain.name}</span>
            )}
          </>
        ) : (
          <span className="pill">Not connected</span>
        )}
      </div>
      <div className="wallet-status-actions">
        <button
          type="button"
          onClick={switchToAlfajores}
          disabled={isSwitching}
        >
          Switch to {alfajores.name}
        </button>
        <button
          type="button"
          onClick={switchToCelo}
          disabled={isSwitching}
        >
          Switch to {celoMainnet.name}
        </button>
      </div>
      {!isSupported && (
        <p className="warning-text">
          You are connected to an unsupported network. Please switch to Celo or
          Alfajores.
        </p>
      )}
    </div>
  );
}
