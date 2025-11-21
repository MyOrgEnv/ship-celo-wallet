import { useAccount } from 'wagmi'
import { useCeloNetwork } from '../hooks/useCeloNetwork'

export function CeloBalance() {
  const { address, isConnected } = useAccount()
  const { activeChain } = useCeloNetwork()

  // Show message when no wallet is connected
  if (!isConnected || !address) {
    return (
      <div className="balance-card">
        <h3>CELO Balance</h3>
        <p>Connect your wallet to see your CELO balance.</p>
      </div>
    )
  }

  return (
    <div className="balance-card">
      <h3>CELO Balance</h3>
      <p>Balance: Loading...</p>
    </div>
  )
}