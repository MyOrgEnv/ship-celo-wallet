import { useAccount, useBalance } from 'wagmi'
import { formatEther } from 'viem'
import { useCeloNetwork } from '../hooks/useCeloNetwork'

export function CeloBalance() {
  const { address, isConnected } = useAccount()
  const { activeChain } = useCeloNetwork()

  // Fetch the native balance using wagmi's useBalance hook
  const { data: balanceData, isLoading, error } = useBalance({
    address,
    query: {
      enabled: isConnected && !!address,
    },
  })

  // Show message when no wallet is connected
  if (!isConnected || !address) {
    return (
      <div className="balance-card">
        <h3>CELO Balance</h3>
        <p>Connect your wallet to see your CELO balance.</p>
      </div>
    )
  }

  // Show loading state while fetching balance
  if (isLoading) {
    return (
      <div className="balance-card">
        <h3>CELO Balance</h3>
        <p>Loading balance...</p>
      </div>
    )
  }

  // Show error state if balance fetching failed
  if (error) {
    return (
      <div className="balance-card">
        <h3>CELO Balance</h3>
        <p>Error loading balance: {error.message}</p>
      </div>
    )
  }

  // Format the balance to human-readable format
  const formatBalance = (value: bigint): string => {
    const balanceStr = formatEther(value)
    
    // Convert to number for easier handling, but be careful with precision
    const num = parseFloat(balanceStr)
    
    // If the balance is very small (less than 0.000001), show more precision
    if (num > 0 && num < 0.000001) {
      return num.toFixed(8)
    }
    
    // For regular balances, show up to 6 decimals but trim trailing zeros
    const formatted = num.toFixed(6)
    return formatted.replace(/\.?0+$/, '')
  }

  const formattedBalance = balanceData?.value 
    ? formatBalance(balanceData.value)
    : '0.000000'

  return (
    <div className="balance-card">
      <h3>CELO Balance</h3>
      <p>Balance: {formattedBalance} CELO on {activeChain?.name || 'Unknown Network'}</p>
    </div>
  )
}