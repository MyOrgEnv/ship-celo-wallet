import './App.css'
import { WalletConnectUI } from './components/WalletConnectUI'
import { WalletStatus } from './components/WalletStatus'
import { CeloBalance } from './components/CeloBalance'

function App() {
  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Web3 Wallet Connect + Celo React Starter Kit</h1>
        <p>React + Vite + Wagmi + WalletConnect, preconfigured for Celo.</p>
      </header>
      <section className="app-topbar">
        <WalletStatus />
      </section>
      <main>
        <WalletConnectUI />
        <CeloBalance />
      </main>
    </div>
  )
}

export default App
