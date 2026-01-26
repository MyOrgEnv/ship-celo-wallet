import './App.css';
import { WalletConnectUI } from './components/WalletConnectUI';
import { WalletStatus } from './components/WalletStatus';
import { CeloBalance } from './components/CeloBalance';
import { TransactionHistory } from './components/TransactionHistory';
import { NetworkHealth } from './components/NetworkHealth';
import { celo, celoAlfajores } from './config/celoChains';
import type { RPCEndpoint } from './types/network';

function App(): JSX.Element {
  const endpoints: RPCEndpoint[] = [
    {
      url: celo.rpcUrls.default.http[0],
      chainId: celo.id,
      status: 'healthy',
      metrics: {
        responseTime: 0,
        successRate: 100,
        lastChecked: new Date(),
        errorCount: 0
      },
      isActive: true
    },
    {
      url: celoAlfajores.rpcUrls.default.http[0],
      chainId: celoAlfajores.id,
      status: 'healthy',
      metrics: {
        responseTime: 0,
        successRate: 100,
        lastChecked: new Date(),
        errorCount: 0
      },
      isActive: true
    }
  ];

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Web3 Wallet Connect + Celo React Starter Kit</h1>
        <p>React + Vite + Wagmi + WalletConnect, preconfigured for Celo.</p>
      </header>
      <section className="app-topbar">
        <WalletStatus />
        <NetworkHealth endpoints={endpoints} />
      </section>
      <main className="app-main">
        <WalletConnectUI />
        <CeloBalance />
        <TransactionHistory className="mt-6" />
      </main>
    </div>
  );
}

export default App;
