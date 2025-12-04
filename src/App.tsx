import './App.css';
import { WalletConnectUI } from './components/WalletConnectUI';
import { WalletStatus } from './components/WalletStatus';
import { CeloBalance } from './components/CeloBalance';
import { TransactionHistory } from './components/TransactionHistory';

function App(): JSX.Element {
  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Web3 Wallet Connect + Celo React Starter Kit</h1>
        <p>React + Vite + Wagmi + WalletConnect, preconfigured for Celo.</p>
      </header>
      <section className="app-topbar">
        <WalletStatus />
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
