import type { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider as BaseWagmiProvider, createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { walletConnect } from 'wagmi/connectors';
import { celo, celoAlfajores } from '../config/celoChains';

// TODO: replace with your own WalletConnect project ID via env
const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined;

if (!WALLETCONNECT_PROJECT_ID) {
  console.warn('VITE_WALLETCONNECT_PROJECT_ID is not set. WalletConnect may not function as expected.');
}

const queryClient = new QueryClient();

const chains = [celoAlfajores, celo] as const;

// Basic Wagmi config using viem http transports and common connectors
const wagmiConfig = createConfig({
  multiInjectedProviderDiscovery: true,
  chains,
  transports: chains.reduce((acc, chain) => {
    acc[chain.id] = http(chain.rpcUrls.default.http[0]);
    return acc;
  }, {} as Record<number, ReturnType<typeof http>>),
  connectors: [
    injected({
      shimDisconnect: true
    }),
    walletConnect({
      projectId: WALLETCONNECT_PROJECT_ID ?? '',
      showQrModal: true,
      metadata: {
        name: 'Web3 Wallet Connect + Celo React Starter Kit',
        description: 'React + Vite + Wagmi + WalletConnect starter for Celo',
        url: 'https://example.com',
        icons: ['https://walletconnect.com/walletconnect-logo.png']
      }
    }),
  ]
});;

export function WagmiProvider({ children }: PropsWithChildren): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <BaseWagmiProvider config={wagmiConfig}>{children}</BaseWagmiProvider>
    </QueryClientProvider>
  );
}
