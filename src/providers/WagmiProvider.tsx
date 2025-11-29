import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider as BaseWagmiProvider, createConfig, http } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { walletConnect } from 'wagmi/connectors'
import { celo, celoAlfajores } from '../config/celoChains'

const walletConnectProjectId =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined

if (!walletConnectProjectId) {
  console.warn(
    'VITE_WALLETCONNECT_PROJECT_ID is not set. WalletConnect may not function as expected.',
  )
}

const queryClient = new QueryClient()
const supportedChains = [celoAlfajores, celo] as const

const transports = supportedChains.reduce<Record<number, ReturnType<typeof http>>>(
  (map, chain) => {
    map[chain.id] = http(chain.rpcUrls.default.http[0])
    return map
  },
  {},
)

const wagmiConfig = createConfig({
  multiInjectedProviderDiscovery: true,
  chains: supportedChains,
  transports,
  connectors: [
    injected({ shimDisconnect: true }),
    walletConnect({
      projectId: walletConnectProjectId ?? '',
      showQrModal: true,
      metadata: {
        name: 'Web3 Wallet Connect + Celo React Starter Kit',
        description: 'React + Vite + Wagmi + WalletConnect starter for Celo',
        url: 'https://example.com',
        icons: ['https://walletconnect.com/walletconnect-logo.png'],
      },
    }),
  ],
})

export function WagmiProvider({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <BaseWagmiProvider config={wagmiConfig}>{children}</BaseWagmiProvider>
    </QueryClientProvider>
  )
}
